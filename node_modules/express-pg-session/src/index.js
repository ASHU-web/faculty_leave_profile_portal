'use strict';

const util = require('util');
const oneDay = 86400;

const currentTimestamp = function () {
  return Math.ceil(Date.now() / 1000);
};

module.exports = function (session) {
  const Store = session.Store || session.session.Store;

  const PGStore = function (options) {
    options = options || {};
    Store.call(this, options);

    this.schemaName = options.schemaName || null;
    this.tableName = options.tableName || 'session';
    this.columns = options.columns || {
      expire: 'expire',
      session_id: 'sid',
      session_data: 'sess'
    };

    this.ttl = options.ttl;

    this.errorLog = options.errorLog || console.error.bind(console);

    if (options.pool !== undefined) {
      this.pool = options.pool;
      this.ownsPg = false;
    } else if (options.pgPromise !== undefined) {
      if (typeof options.pgPromise.query !== 'function') {
        throw new Error('`pgPromise` config must point to an existing and configured instance of pg-promise pointing at your database');
      }
      this.pgPromise = options.pgPromise;
      this.ownsPg = false;
    } else {
      const conString = options.conString || process.env.DATABASE_URL;
      let conObject = options.conObject;

      if (!conObject) {
        conObject = {};

        if (conString) {
          conObject.connectionString = conString;
        }
      }

      this.pool = new (require('pg')).Pool(conObject);
      this.pool.on('error', err => {
        this.errorLog('PG Pool error:', err.message);
      });
      this.ownsPg = true;
    }

    if (options.pruneSessionInterval === false) {
      this.pruneSessionInterval = false;
    } else {
      this.pruneSessionInterval = (options.pruneSessionInterval || 60) * 1000;
      setImmediate(function () {
        this.pruneSessions();
      }.bind(this));
    }
  };

  /**
   * Inherit from `Store`.
   */

  util.inherits(PGStore, Store);

  /**
   * Closes the session store
   *
   * Currently only stops the automatic pruning, if any, from continuing
   *
   * @access public
   */

  PGStore.prototype.close = function () {
    this.closed = true;

    if (this.pruneTimer) {
      clearTimeout(this.pruneTimer);
      this.pruneTimer = undefined;
    }

    if (this.ownsPg) {
      this.pool.end();
    }
  };

  /**
   * Does garbage collection for expired session in the database
   *
   * @param {Function} [fn] - standard Node.js callback called on completion
   * @access public
   */

  PGStore.prototype.pruneSessions = function (fn) {
    this.query(`DELETE FROM ${this.quotedTable()} WHERE ${this.columns.expire} < to_timestamp($1)`, [currentTimestamp()], function (err) {
      if (fn && typeof fn === 'function') {
        return fn(err);
      }

      if (err) {
        this.errorLog('Failed to prune sessions:', err.message);
      }

      if (this.pruneSessionInterval && !this.closed) {
        if (this.pruneTimer) {
          clearTimeout(this.pruneTimer);
        }
        this.pruneTimer = setTimeout(this.pruneSessions.bind(this, true), this.pruneSessionInterval);
        this.pruneTimer.unref();
      }
    }.bind(this));
  };

  /**
   * Get the quoted table.
   *
   * @return {String} the quoted schema + table for use in queries
   * @access private
   */

  PGStore.prototype.quotedTable = function () {
    let result = '"' + this.tableName + '"';

    if (this.schemaName) {
      result = '"' + this.schemaName + '".' + result;
    }

    return result;
  };

  /**
   * Figure out when a session should expire
   *
   * @param {Number} [maxAge] - the maximum age of the session cookie
   * @return {Number} the unix timestamp, in seconds
   * @access private
   */

  PGStore.prototype.getExpireTime = function (maxAge) {
    let ttl = this.ttl;

    ttl = ttl || (typeof maxAge === 'number' ? maxAge / 1000 : oneDay);
    ttl = Math.ceil(ttl + currentTimestamp());

    return ttl;
  };

  /**
   * Query the database.
   *
   * @param {String} query - the database query to perform
   * @param {(Array|Function)} [params] - the parameters of the query or the callback function
   * @param {Function} [fn] - standard Node.js callback returning the resulting rows
   * @access private
   */

  PGStore.prototype.query = function (query, params, fn) {
    if (!fn && typeof params === 'function') {
      fn = params;
      params = [];
    }

    if (this.pgPromise) {
      this.pgPromise.query(query, params || [])
        .then(function (res) { fn && fn(null, res && res[0] ? res[0] : false); })
        .catch(function (err) { fn && fn(err, false); });
    } else {
      this.pool.query(query, params || [], function (err, res) {
        if (fn) { fn(err, res && res.rows[0] ? res.rows[0] : false); }
      });
    }
  };

  /**
   * Attempt to fetch session by the given `sid`.
   *
   * @param {String} sid – the session id
   * @param {Function} fn – a standard Node.js callback returning the parsed session object
   * @access public
   */

  PGStore.prototype.get = function (sessionId, fn) {
    this.query(
      `SELECT ${this.columns.session_data} FROM ${this.quotedTable()}
      WHERE ${this.columns.session_id} = $1 AND expire >= to_timestamp($2)`,
      [sessionId, currentTimestamp()],
      function (err, data) {
        if (err) { return fn(err); }
        if (!data) { return fn(); }
        try {
          return fn(null, (typeof data[this.columns.session_data] === 'string') ? JSON.parse(data[this.columns.session_data]) : data[this.columns.session_data]);
        } catch (e) {
          return this.destroy(sessionId, fn);
        }
      }.bind(this));
  };

  /**
   * Commit the given `sess` object associated with the given `sid`.
   *
   * @param {String} sid – the session id
   * @param {Object} sess – the session object to store
   * @param {Function} fn – a standard Node.js callback returning the parsed session object
   * @access public
   */

  PGStore.prototype.set = function (sessionId, sessionData, fn) {
    const expireTime = this.getExpireTime(sessionData.cookie.maxAge);
    const query1 = `
      UPDATE ${this.quotedTable()}
      SET ${this.columns.session_data} = $1, expire = to_timestamp($2)
      WHERE ${this.columns.session_id} = $3
      RETURNING ${this.columns.session_id}
    `;

    this.query(query1, [sessionData, expireTime, sessionId], (err, data) => {
      if (!err && data === false) {
        const query2 = `
          INSERT INTO ${this.quotedTable()}
          (
            ${this.columns.session_data},
            ${this.columns.expire},
            ${this.columns.session_id}
          )
          SELECT $1, to_timestamp($2), $3
          WHERE NOT EXISTS (
            SELECT 1 FROM ${this.quotedTable()}
            WHERE ${this.columns.session_id} = $4
          )
        `;

        this.query(query2, [sessionData, expireTime, sessionId, sessionId], function (err) {
          if (fn) { fn.apply(this, err); }
        });
      } else {
        if (fn) { fn.apply(this, err); }
      }
    });
  };

  /**
   * Destroy the session associated with the given `sid`.
   *
   * @param {String} sid – the session id
   * @access public
   */

  PGStore.prototype.destroy = function (sessionId, fn) {
    this.query(
      `DELETE FROM ${this.quotedTable()} WHERE ${this.columns.session_id} = $1`,
      [sessionId],
      function (err) {
        if (fn) { fn(err); }
      }
    );
  };

  /**
   * Touch the given session object associated with the given session ID.
   *
   * @param {String} sid – the session id
   * @param {Object} sess – the session object to store
   * @param {Function} fn – a standard Node.js callback returning the parsed session object
   * @access public
   */

  PGStore.prototype.touch = function (sessionId, sessionData, fn) {
    const expireTime = this.getExpireTime(sessionData.cookie.maxAge);

    this.query(
      `UPDATE ${this.quotedTable()}
        SET ${this.columns.expire} = to_timestamp($1)
        WHERE {this.columns.session_id} = $2
        RETURNING {this.columns.session_id}
      `,
      [expireTime, sessionId],
      function (err) { fn(err); }
    );
  };

  return PGStore;
};
