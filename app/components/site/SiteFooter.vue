<template>
  <footer class="bg-neutral-900 text-white">
    <!-- Main Footer -->
    <div class="px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <!-- Left: Logo and Social -->
        <div>
          <h2
            class="font-condensed text-4xl md:text-5xl lg:text-6xl font-bold uppercase leading-none mb-8"
          >
            СТРОИМ<br />ИНАЧЕ
          </h2>
          <div class="flex items-center gap-4">
            <a
              href="#"
              class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <UIcon name="i-lucide-send" class="w-5 h-5" />
            </a>
            <a
              href="#"
              class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <UIcon name="i-lucide-circle-dot" class="w-5 h-5" />
            </a>
            <a
              href="#"
              class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <UIcon name="i-lucide-at-sign" class="w-5 h-5" />
            </a>
            <a
              href="#"
              class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <UIcon name="i-lucide-bookmark" class="w-5 h-5" />
            </a>
            <a
              href="#"
              class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <UIcon name="i-lucide-home" class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- Right: Navigation Columns -->
        <div class="grid grid-cols-2 gap-8">
          <!-- Objects -->
          <div>
            <h3 class="text-xs uppercase tracking-[0.15em] text-white/50 mb-4">
              ОБЪЕКТЫ
            </h3>
            <ul class="space-y-2">
              <li v-if="objects" v-for="object in objects" :key="object.id">
                <NuxtLink
                  :to="`/objects/${object.slug}`"
                  class="text-sm text-white/80 hover:text-white transition-colors"
                >
                  {{ object.name.toUpperCase() }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Company -->
          <div>
            <h3 class="text-xs uppercase tracking-[0.15em] text-white/50 mb-4">
              КОМПАНИЯ
            </h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink
                  to="/about"
                  class="text-sm text-white/80 hover:text-white transition-colors"
                >
                  О НАС
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="#"
                  class="text-sm text-white/80 hover:text-white transition-colors"
                >
                  ДОКУМЕНТЫ
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/contacts"
                  class="text-sm text-white/80 hover:text-white transition-colors"
                >
                  КОНТАКТЫ
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-white/10 px-6 md:px-12 lg:px-16 py-6">
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-[10px] text-white/40 leading-relaxed"
      >
        <!-- Copyright -->
        <div>
          <p>© ООО "СК "Дельтастрой", 2013 - 2026</p>
          <p class="mt-2">
            Юридический адрес:<br />
            660064, Красноярский край, г. Красноярск,<br />
            ул. Капитанская, д. 14, помещение 349
          </p>
          <p class="mt-2">
            ИНН 2465072661 КПП 246401001<br />
            ОГРН 1042402221150
          </p>
        </div>

        <!-- Links 1 -->
        <div>
          <ul class="space-y-1">
            <li>
              <a href="#" class="hover:text-white/60 transition-colors">
                Политика конфиденциальности
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-white/60 transition-colors">
                Согласие на обработку персональных данных
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-white/60 transition-colors">
                Согласие на получение рассылки
              </a>
            </li>
          </ul>
        </div>

        <!-- Links 2 -->
        <div>
          <ul class="space-y-1">
            <li>
              <a href="#" class="hover:text-white/60 transition-colors">
                Проектные декларации на сайте наш.дом.рф
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-white/60 transition-colors">
                *Информация на сайте не является публичной офертой
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { objectsService } from "~/api/objects.service";
import type { ObjectWithRelations } from "~/api/types";

const { data: objects } = await useAsyncData<ObjectWithRelations[]>(
  "footer-objects",
  () => objectsService.getAll(),
);
</script>
