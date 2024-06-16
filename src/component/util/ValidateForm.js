const validateInput = async (name, value, userSchema) => {
  try {
    await userSchema.validateAt(name, { [name]: value });
    return { name, error: "" };
  } catch (error) {
    return { name, error: error.message };
  }
};

const validateAllInputs = async (data, userSchema, setErrors) => {
  const validationResults = await Promise.all(
    Object.keys(data).map(
      async (name) => await validateInput(name, data[name], userSchema)
    )
  );

  const errors = validationResults.reduce((acc, { name, error }) => {
    if (error) {
      acc[name] = error;
    }
    return acc;
  }, {});

  setErrors(errors);

  return errors;
};

export { validateInput, validateAllInputs };
