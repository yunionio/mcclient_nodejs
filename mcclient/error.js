class HTTPError extends Error {
  constructor(msg, statusCode) {
    super(msg);
    this.status = statusCode;
  }
}

class UnauthorizedError extends HTTPError {
  constructor(msg) {
    super(msg, 401);
  }
}

module.exports.UnauthorizedError = UnauthorizedError;

class InvalidCredentialError extends UnauthorizedError {
}

module.exports.InvalidCredentialError = InvalidCredentialError;

class ForbiddenError extends HTTPError {
  constructor(msg) {
    super(msg, 403);
  }
}

module.exports.ForbiddenError = ForbiddenError;

class NotFoundError extends HTTPError {
  constructor(msg) {
    super(msg, 404);
  }
}

module.exports.NotFoundError = NotFoundError;

class NotImplementedError extends NotFoundError {
}

module.exports.NotImplementedError = NotImplementedError;

class NotAcceptableError extends HTTPError {
  constructor(msg) {
    super(msg, 406);
  }
}

module.exports.NotAcceptableError = NotAcceptableError;

class InvalidInputError extends NotAcceptableError {
}

module.exports.InvalidInputError = InvalidInputError;

class ConflictError extends HTTPError {
  constructor(msg) {
    super(msg, 409);
  }
}

module.exports.ConflictError = ConflictError;

module.exports.clientError = function(err, code) {
  if (err.constructor.name === 'String') {
    try {
      err = JSON.parse(err)
    }catch (e) {
      err = {code: code ? code : 500, details: err}
    }
  } else {
    if (!err.details) {
      err.details = err
    }
    if (!err.code) {
      if (code) {
        err.code = code;
      } else {
        err.code = 500;
      }
    }
  }
  if (err.class && module.exports[err.class]) {
    let ecls = module.exports[err.class]
    return new ecls(err.details)
  } else {
    let e = new HTTPError(err.details, err.code);
    if (err.class) {
      e.class = err.class;
    }
    return e;
  }
}
