type Result =
  | {
      success: null;
      defaultValue: '';
    }
  | {
      success: true;
      defaultValue: '';
    }
  | {
      success: false;
      message: string;
      defaultValue: string;
    };

export const contact = (
  _previousState: Result,
  _formData: FormData,
): Promise<Result> =>
  Promise.resolve().then(() => ({
    success: true,
    defaultValue: '',
  }));
