const success = (data) => {
  return {
    status: 'success',
    data,
  };
};

const fail = (data) => {
  return {
    status: 'fail',
    data,
  };
};

const error = (message, stack) => {
  return {
    status: 'error',
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : stack,
  };
};

export { success, fail, error };
