export const PASSWORD_POLICY_REGEX = /^(?=\S+$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,128}$/;
export const PASSWORD_POLICY_MESSAGE = "Password must be 8-128 characters, include uppercase, lowercase, number, and special character, and contain no spaces";
export function isPasswordValid(password) {
    return PASSWORD_POLICY_REGEX.test(password);
}
