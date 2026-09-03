/**
 * Utility functions for handling Express route parameters
 */

/**
 * Safely extract a string parameter from Express req.params
 * Handles cases where the parameter might be an array
 * @param param - The parameter value from req.params
 * @returns The parameter as a string or undefined if not valid
 */
export function getStringParam(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) {
    return param[0] || undefined;
  }
  return param || undefined;
}

/**
 * Safely extract a required string parameter from Express req.params
 * Throws an error if the parameter is missing or invalid
 * @param param - The parameter value from req.params
 * @param paramName - The name of the parameter for error messages
 * @returns The parameter as a string
 * @throws Error if parameter is missing
 */
export function getRequiredStringParam(param: string | string[] | undefined, paramName: string): string {
  const value = getStringParam(param);
  if (!value) {
    throw new Error(`${paramName} is required`);
  }
  return value;
}