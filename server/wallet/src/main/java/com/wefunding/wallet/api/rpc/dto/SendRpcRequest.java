package com.wefunding.wallet.api.rpc.dto;

import java.util.List;

public record SendRpcRequest(
    long chainId, String jsonrpc, Object id, String method, List<Object> params) {}
