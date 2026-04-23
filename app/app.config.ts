export default defineAppConfig({
  ui: {
    colors: {
      primary: "neutral",
      neutral: "slate",
    },

    strategy: "override",

    // --- Базовые элементы ---
    button: { slots: { base: "rounded-none" } },
    input: { slots: { root: "rounded-none!" } },
    card: { slots: { root: "rounded-none" } },
    table: {
      slots: {
        root: "rounded-none",
        thead: "rounded-none",
        tbody: "rounded-none",
      },
    },

    // --- Формы и ввод (Добавлено) ---
    formField: {
      slots: {
        root: "rounded-none",
        wrapper: "rounded-none",
        label: "text-neutral-900 font-medium",
      },
    },
    select: { slots: { root: "rounded-none" } },
    selectMenu: { slots: { root: "rounded-none", content: "rounded-none" } },
    textarea: { slots: { root: "rounded-none" } },
    checkbox: { slots: { root: "rounded-none", base: "rounded-none" } },
    radioGroup: { slots: { root: "rounded-none", base: "rounded-none" } },
    switch: {
      slots: {
        root: "rounded-none",
        base: "rounded-none",
        handle: "rounded-none",
      },
    },

    modal: {
      slots: {
        content: "rounded-none",
      },
    },
    slideover: {
      slots: {
        content: "rounded-none",
      },
    },
    popover: {
      slots: {
        content: "rounded-none",
      },
    },
    dropdownMenu: {
      slots: {
        content: "rounded-none",
        item: "rounded-none",
      },
    },
  },
});
