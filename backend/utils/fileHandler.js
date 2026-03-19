// backend/utils/fileHandler.js
// 统一 SQL 适配层：支持 Cloudflare D1（异步）和 better-sqlite3（同步包装为异步）

/**
 * 判断当前 env.DB 是否为 D1Database（CF 模式）
 * D1Database 的 prepare 方法返回的对象有 .all() 方法且是异步的
 */
const isD1 = (env) => {
  return env && env.DB && typeof env.DB.prepare === 'function' && !env.DB.__isBetterSqlite3;
};

/**
 * 执行 INSERT / UPDATE / DELETE 语句
 * @param {object} env - Hono context env（含 env.DB）
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<{changes: number, lastInsertRowid: number|bigint}>}
 */
const execSQL = async (env, sql, params = []) => {
  if (isD1(env)) {
    const result = await env.DB.prepare(sql).bind(...params).run();
    return { changes: result.meta?.changes ?? 0, lastInsertRowid: result.meta?.last_row_id ?? null };
  } else {
    // better-sqlite3 同步接口，包装为 Promise
    const stmt = env.DB.prepare(sql);
    const result = stmt.run(...params);
    return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
  }
};

/**
 * 查询单行
 * @param {object} env
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<object|null>}
 */
const queryOne = async (env, sql, params = []) => {
  if (isD1(env)) {
    const result = await env.DB.prepare(sql).bind(...params).first();
    return result || null;
  } else {
    const stmt = env.DB.prepare(sql);
    return stmt.get(...params) || null;
  }
};

/**
 * 查询多行
 * @param {object} env
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<Array>}
 */
const queryAll = async (env, sql, params = []) => {
  if (isD1(env)) {
    const result = await env.DB.prepare(sql).bind(...params).all();
    return result.results || [];
  } else {
    const stmt = env.DB.prepare(sql);
    return stmt.all(...params);
  }
};

/**
 * 批量执行（事务）
 * @param {object} env
 * @param {Array<{sql: string, params: Array}>} statements
 * @returns {Promise<void>}
 */
const batchExec = async (env, statements) => {
  if (isD1(env)) {
    const prepared = statements.map(({ sql, params = [] }) =>
      env.DB.prepare(sql).bind(...params)
    );
    await env.DB.batch(prepared);
  } else {
    // better-sqlite3 使用 transaction
    const run = env.DB.transaction(() => {
      for (const { sql, params = [] } of statements) {
        env.DB.prepare(sql).run(...params);
      }
    });
    run();
  }
};

module.exports = {
  execSQL,
  queryOne,
  queryAll,
  batchExec,
};
