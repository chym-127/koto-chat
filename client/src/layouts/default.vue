<script setup lang="ts">
function logout() {
  localStorage.clear();
  location.reload();
}

function comeSoon() {
  alert('come soon');
}
</script>
<template>
  <div class="w-full h-full bg-[#f0f0f0] flex relative">
    <div class="left-box w-[74px] h-full bg-[#F9F9F9] flex flex-col justify-center items-between">
      <div class="logo mt-[36px] h-[80px]"></div>
      <div class="menus w-full flex flex-col justify-start items-center space-y-4 flex-1 h-0">
        <div class="menu w-[40px] h-[40px] rounded flex justify-center items-center" @click="comeSoon">
          <i class="iconfont icon-home"></i>
        </div>
        <div class="menu w-[40px] h-[40px] rounded flex justify-center items-center bg-[#EED8FF]">
          <i class="iconfont icon-chat text-[#A251E1]"></i>
        </div>
        <div class="menu w-[40px] h-[40px] rounded flex justify-center items-center" @click="comeSoon">
          <i class="iconfont icon-game"></i>
        </div>
        <div class="menu w-[40px] h-[40px] rounded flex justify-center items-center" @click="comeSoon">
          <i class="iconfont icon-setting"></i>
        </div>
      </div>
      <div class="logout cursor-pointer h-[80px] w-full flex justify-center items-center">
        <div @click="logout" class="w-[40px] h-[40px] rounded flex justify-center items-center">
          <i class="iconfont icon-logout"></i>
        </div>
      </div>
    </div>
    <div class="right-box flex-1 w-0 h-full flex flex-col">
      <router-view></router-view>
    </div>
  </div>
</template>
