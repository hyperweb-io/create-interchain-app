<script setup lang="ts">
import { Box, Button, Text, Link } from "@interchain-ui/vue";
import { computed, ref } from "vue";
import { useBalanceVue } from "../composables/injective/useBalanceVue";
import { useChain } from "@interchain-kit/vue";
import { MessageComposer } from "../../../injective/src/codegen/cosmos/bank/v1beta1/tx.registry";
import { useInjectiveClient } from "../composables/common/useInjectiveClient";

const chainName = ref("injective");
const injectiveClient = useInjectiveClient(chainName);
const { address, chain } = useChain(chainName);
const {
  balance,
  isBalanceLoaded,
  isFetchingBalance,
  refetchBalance,
  denom,
} = useBalanceVue(chainName);

const txHash = ref("");

const sending = ref(false);
console.log("chain>", chain);
const txPage = computed(() => {
  return chain?.value.explorers?.[0]?.txPage;
});

const computedBalance = computed(() => {
  return balance ?? null;
});

const handleSend = async () => {
  sending.value = true;
  const fee = {
    amount: [
      {
        denom,
        amount: "2500",
      },
    ],
    gas: "1000000",
  };

  // const msgs = [{
  //   typeUrl: '/cosmos.bank.v1beta1.MsgSend',
  //   value: {
  //     fromAddress: address.value,
  //     toAddress: address.value,
  //     amount: [{ denom, amount: '1' }]
  //   }
  // }]

  const { send } = MessageComposer.withTypeUrl;
  const msgs = [
    send({
      fromAddress: address.value,
      toAddress: address.value,
      amount: [{ denom, amount: "1" }],
    }),
  ];

  console.log("msgs", msgs);
  try {
    const data = (await injectiveClient.value.signAndBroadcast(
      address.value,
      msgs,
      fee,
      "using interchainjs"
    )) as any;
    console.log("onSuccess", data);
    if (data.code === 0) {
      refetchBalance();
      txHash.value = data.hash;
    }
  } catch (error: any) {
    console.log("onError", error);
  } finally {
    sending.value = false;
  }
};
</script>

<template>
  <Box display="flex" flexDirection="column" alignItems="center">
    <Box mb="$4">
      <Text fontSize="$2xl"
        >Balance: {{ isFetchingBalance ? "--" : computedBalance }}
      </Text>
    </Box>
    <Button :disabled="sending" @click="handleSend"> Send </Button>
    <Box v-if="txHash" mt="$4" display="flex" flexDirection="row" alignItems="center">
      <Text :attributes="{ mr: '$1' }">Details:</Text>
      <Link :href="txPage?.replace('${txHash}', txHash)!" target="_blank">
        {{txPage?.replace('${txHash}', txHash)!}}
      </Link>
    </Box>
  </Box>
</template>

<style scoped></style>
