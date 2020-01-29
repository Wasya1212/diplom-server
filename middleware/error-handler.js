const errorhandler = (props) => async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    props.errorLogger[props.logMethodName || 'error'](`${err.status || 500} - ${err.message} - ${ctx.url} - ${ctx.method} - ${ctx.ip}`) || null;

    if (err.status === 500) {
      console.log('Internal server error:', err);
    }

    ctx.status = err.statusCode || err.status || 500;
    ctx.assert(false, err.status || 500, err.message);
  }
};

module.exports = (props) => errorhandler(props);
