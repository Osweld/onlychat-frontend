export interface LoginCredentials {
    username: string;
    password: string;
  }

  export interface LoginResponse {
    id:             number;
    token:          string;
    username:       string;
    expirationDate: Date;
}

export interface SignupCredentials {
    username: string;
    email: string;
    password: string;
}

export interface SignupResponse {
  id:         number;
  username:   string;
  email:      string;
  createdAt:  Date;
  rol:        string;
  userStatus: string;
}

export interface Error {
  status:  string;
  error:   string;
  message: string;
  path:    string;
  details: Details;
}

export interface Details {
  resend:  boolean;
  message: string;
}



