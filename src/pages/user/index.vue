<template>
  <view class="page">
    <view class="content">
      <text class="welcome">欢迎回来</text>
    </view>
  </view>
</template>

<script setup>
</script>

<style>
.page {
  min-height: 100vh;
  padding: 60rpx 40rpx;
  box-sizing: border-box;
  background-color: #f5f5f5;
}

.header {
  font-size: 40rpx;
  font-weight: 600;
  text-align: center;
  margin-bottom: 40rpx;
}

.content {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.06);
}

.welcome {
  font-size: 32rpx;
  color: #333333;
}
</style>

