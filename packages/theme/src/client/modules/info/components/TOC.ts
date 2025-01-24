/* eslint-disable vue/require-default-prop */
import type { HeaderItem } from "@vuepress/helper/client";
import { useToggle } from "@vueuse/core";
import type { PropType, SlotsType, VNode } from "vue";
import { defineComponent, h, onMounted, ref, shallowRef, watch } from "vue";
import type { PageHeader } from "vuepress/client";
import { RouteLink, useRoute } from "vuepress/client";

import { useHeaders } from "@theme-hope/composables/index";
import PrintButton from "@theme-hope/modules/info/components/PrintButton";
import { useMetaLocale } from "@theme-hope/modules/info/composables/index";

import "../styles/toc.scss";

export default defineComponent({
  name: "TOC",

  props: {
    /**
     * TOC items config
     *
     * TOC 项目配置
     */
    items: Array as PropType<PageHeader[]>,
  },

  slots: Object as SlotsType<{
    before?: () => VNode[] | VNode | null;
    after?: () => VNode[] | VNode | null;
  }>,

  setup(props, { slots }) {
    const route = useRoute();
    const headers = useHeaders();
    const metaLocale = useMetaLocale();
    const [isExpanded, toggleExpanded] = useToggle();

    const toc = shallowRef<HTMLElement>();
    const tocMarkerTop = ref("-1.7rem");

    const scrollTo = (top: number): void => {
      toc.value?.scrollTo({ top, behavior: "smooth" });
    };

    const updateTocMarker = (): void => {
      if (toc.value) {
        const activeTocItem = document.querySelector(".vp-toc-item.active");

        if (activeTocItem)
          tocMarkerTop.value = `${
            // Active toc item top
            activeTocItem.getBoundingClientRect().top -
            // Toc top
            toc.value.getBoundingClientRect().top +
            // Toc scroll top
            toc.value.scrollTop
          }px`;
        else tocMarkerTop.value = "-1.7rem";
      } else {
        tocMarkerTop.value = "-1.7rem";
      }
    };

    onMounted(() => {
      // Scroll to active toc item
      watch(
        () => route.hash,
        (hash): void => {
          if (toc.value) {
            // Get the active toc item DOM, whose href equals to the current route
            const activeTocItem = document.querySelector(
              `#toc a.vp-toc-link[href$="${hash}"]`,
            );

            if (!activeTocItem) return;

            // Get the top and height of the toc
            const { top: tocTop, height: tocHeight } =
              toc.value.getBoundingClientRect();
            // Get the top and height of the active toc item
            const { top: activeTocItemTop, height: activeTocItemHeight } =
              activeTocItem.getBoundingClientRect();

            // When the active toc item overflows the top edge of toc
            if (activeTocItemTop < tocTop)
              // Scroll to the top edge of toc
              scrollTo(toc.value.scrollTop + activeTocItemTop - tocTop);
            // When the active toc item overflows the bottom edge of toc
            else if (
              activeTocItemTop + activeTocItemHeight >
              tocTop + tocHeight
            )
              // Scroll to the bottom edge of toc
              scrollTo(
                toc.value.scrollTop +
                  activeTocItemTop +
                  activeTocItemHeight -
                  tocTop -
                  tocHeight,
              );
          }
        },
      );

      watch(() => route.fullPath, updateTocMarker, {
        flush: "post",
        immediate: true,
      });
    });

    const renderHeader = ({
      title,
      level,
      slug,
    }: HeaderItem | PageHeader): VNode =>
      h(
        RouteLink,
        {
          to: `#${slug}`,
          class: ["vp-toc-link", `level${level}`],
          onClick: () => {
            toggleExpanded();
          },
        },
        () => title,
      );

    const renderChildren = (
      headers?: PageHeader[] | HeaderItem[],
    ): VNode | null =>
      headers?.length
        ? h(
            "ul",
            { class: "vp-toc-list" },
            headers.map((header) => {
              const children = renderChildren(header.children);

              return [
                h(
                  "li",
                  {
                    class: [
                      "vp-toc-item",
                      { active: route.hash === `#${header.slug}` },
                    ],
                  },
                  renderHeader(header),
                ),
                children ? h("li", children) : null,
              ];
            }),
          )
        : null;

    return (): VNode | null => {
      const tocHeaders = renderChildren(props.items ?? headers.value);
      const before = slots.before?.();
      const after = slots.after?.();

      return tocHeaders || before || after
        ? h("div", { class: "vp-toc-placeholder" }, [
            h("aside", { id: "toc", "vp-toc": "" }, [
              before,
              tocHeaders
                ? [
                    h(
                      "div",
                      {
                        class: "vp-toc-header",
                        onClick: () => {
                          toggleExpanded();
                        },
                      },
                      [
                        metaLocale.value.toc,
                        h(PrintButton),
                        h("div", {
                          class: ["arrow", isExpanded.value ? "down" : "end"],
                        }),
                      ],
                    ),
                    h(
                      "div",
                      {
                        class: [
                          "vp-toc-wrapper",
                          isExpanded.value ? "open" : "",
                        ],
                        ref: toc,
                      },
                      [
                        tocHeaders,
                        h("div", {
                          class: "vp-toc-marker",
                          style: {
                            top: tocMarkerTop.value,
                          },
                        }),
                      ],
                    ),
                  ]
                : null,
              after,
            ]),
          ])
        : null;
    };
  },
});
