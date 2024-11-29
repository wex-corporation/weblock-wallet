import { Client } from '../utils/httpClient'
import {
  SignInRequest,
  SignInResponse,
  User
} from '@wefunding-dev/wallet-types'

export class UserClient {
  private readonly baseUrl = '/v1/users'
  private readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  /**
   * Perform user sign-in with Firebase credentials.
   * @param request - SignInRequest containing user credentials.
   * @returns SignInResponse - Contains token and user details.
   * @throws Error if the sign-in process fails.
   */
  async signIn(request: SignInRequest): Promise<SignInResponse> {
    const response = await this.client.post<SignInResponse>(
      `${this.baseUrl}/sign-in`,
      request,
      { needsAccessToken: false }
    )

    if (!response) {
      throw new Error('Failed to sign in')
    }
    return response
  }

  /**
   * Fetch the currently signed-in user's details.
   * @returns User - The details of the authenticated user.
   * @throws Error if the user is not found.
   */
  async getUser(): Promise<User> {
    const response = await this.client.get<User>(`${this.baseUrl}`)
    if (!response) {
      throw new Error('User not found')
    }
    return response
  }
}
