package com.altech.core.domain.blockchain;

import com.altech.core.domain.baseEntity.DomainEntity;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Getter
@Table("blockchains")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Blockchain extends DomainEntity {

  private String name;

  @Column("rpc_url")
  private String rpcUrl;

  @Column("chain_id")
  private long chainId;

  @Column("currency_symbol")
  private String currencySymbol;

  @Column("currency_name")
  private String currencyName;

  @Column("currency_decimals")
  private long currencyDecimals;

  @Column("is_testnet")
  private boolean isTestnet;

  @Column("is_default")
  private boolean isDefault;

  @Column("explorer_url")
  private String explorerUrl;

  public static Blockchain createDefault(
      String name,
      String rpcUrl,
      long chainId,
      String currencySymbol,
      String currencyName,
      long currencyDecimals,
      boolean isTestnet,
      String explorerUrl) {
    return new Blockchain(
        name,
        rpcUrl,
        chainId,
        currencySymbol,
        currencyName,
        currencyDecimals,
        isTestnet,
        true,
        explorerUrl);
  }

  public static Blockchain create(
      String name,
      String rpcUrl,
      long chainId,
      String currencySymbol,
      String currencyName,
      long currencyDecimals,
      boolean isTestnet,
      String explorerUrl) {
    return new Blockchain(
        name,
        rpcUrl,
        chainId,
        currencySymbol,
        currencyName,
        currencyDecimals,
        isTestnet,
        false,
        explorerUrl);
  }

  public static List<Blockchain> defaults() {
    List<Blockchain> blockchains = new ArrayList<>();
    blockchains.add(
        Blockchain.createDefault(
            "Ethereum",
            "https://mainnet.infura.io/v3/8421335523a548d0914c7bf652e4b7c2",
            1,
            "ETH",
            "Ethereum",
            18L,
            false,
            "https://etherscan.io"));
    blockchains.add(
        Blockchain.createDefault(
            "Goerli",
            "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
            5,
            "ETH",
            "Ethereum",
            18L,
            true,
            "https://goerli.etherscan.io"));
    blockchains.add(
        Blockchain.createDefault(
            "Sepolia",
            "https://ethereum-sepolia.publicnode.com",
            11155111,
            "SepoliaETH",
            "Ethereum",
            18L,
            true,
            "https://sepolia.etherscan.io"));
    blockchains.add(
        Blockchain.createDefault(
            "Binance Smart Chain Mainnet",
            "https://bsc-dataseed1.binance.org",
            56,
            "BNB",
            "Binanace Coin",
            18L,
            false,
            "https://bscscan.com"));
    blockchains.add(
        Blockchain.createDefault(
            "BNB Smart Chain Testnet",
            "https://bsc-testnet.publicnode.com",
            97,
            "tBNB",
            "Binanace Coin",
            18L,
            true,
            "https://testnet.bscscan.com"));
    blockchains.add(
        Blockchain.createDefault(
            "Polygon",
            "https://polygon-rpc.com/",
            137,
            "MATIC",
            "Polygon",
            18L,
            false,
            "https://polygonscan.com"));
    blockchains.add(
        Blockchain.createDefault(
            "Mumbai",
            "https://rpc-mumbai.maticvigil.com",
            80001,
            "MATIC",
            "Polygon",
            18L,
            true,
            "https://mumbai.polygonscan.com"));
    return blockchains;
  }
}
