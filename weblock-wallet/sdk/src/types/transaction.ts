/**
 * 트랜잭션 설정
 * @public
 */
export interface TransactionConfig {
  /** 수신자 주소 */
  to: string
  /** 전송 금액 (wei 단위) */
  value: string
  /** 트랜잭션 데이터 (선택) */
  data?: string
  /** 가스 한도 (선택) */
  gasLimit?: string
}

/**
 * 트랜잭션 결과
 * @public
 */
export interface TransactionResult {
  /** 트랜잭션 해시 */
  hash: string
  /** 트랜잭션 확인 여부 */
  confirmed: boolean
}
