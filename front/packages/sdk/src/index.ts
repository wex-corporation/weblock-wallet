// import { Core } from '@alwallet/core/src'

// function intializeCore() {
//   const core = new Core(
//     'local',
//     'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUFyVFFHUmsvQnRoUkQ5S3dnZ0tsMgp3RnlaUE1YaysveW4vR0RzbmEzRWpsTDJLTkcyRmRxa3JwM3l5bHlFajBobHFUakd3YkZaQlcvMk1FVG5BN2JMCkNxdWo2K2FpT3duMHZOclU1b25YWW1PQk9yNE50Y1Nva1pCNWJXWUZhdlZRTlpmdy9JVDdqNkt1Nll5K0VQVVIKRW5RMVJGU0FuSUhWd0YrN0hidlVjcElsQUtRY0NlbVB6dk8yNGhWeEgzMmpEMUZFOTYvTTE0SVN2cVZ2RmFOSwo3eUVYaElLcUM0TU5uK0JjWjdDbnJFaWQ5MUxzbU41cFBMVWFhMUVBT2RremM0ZWhxOHFsNkJmN1hPQjBIUHJaCktlSkhiaGpjVExFUkE1blVPeHFXaFUwL2UxVGIxOExGUmFlUmZzTzdPS2NvbW1aQmpIU3U3L0dwVlVkMHNLMHQKSFFJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==',
//     'http://localhost:3000'
//   )
// }

// src/index.ts

export { default as CoreAdapter } from './coreAdapter'
export type { CoreConfig } from './coreAdapter' // coreAdapter에서 CoreConfig 타입을 가져와 내보냄
export type { SendTransaction } from '@weblock-wallet/types' // 주요 타입 중 필요한 것만 추가로 내보낼 수 있음
