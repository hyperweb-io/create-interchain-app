<script setup lang="ts">
import { Box, Container } from '@interchain-ui/vue';
import HeaderComp from './header.vue';
</script>

<template>
  <Box top="0" bottom="0" left="0" right="0" :flex="1" backgroundColor="$white" data-part-id="layout-container">
    <Container maxWidth="64rem" :attributes="{
      paddingY: '$14',
    }">

      <Head>
        <title>Asset List - Create Interchain App</title>
        <meta name="description" content="Generated by create interchain app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <HeaderComp />

      <div id="body">
        <slot></slot>
      </div>

      <!-- <Footer /> -->
    </Container>
  </Box>
</template>

<style scoped></style>
