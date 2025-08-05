export function setJwt(jwt: string) {
  localStorage.setItem("jwt", jwt);
}

export function getJwt(): string | null {
  return localStorage.getItem("jwt");
}
