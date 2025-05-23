import { LoadingIcon, startsWith } from "@vuepress/helper/client";
import type { VNode } from "vue";
import { computed, defineComponent, h, ref } from "vue";
import { useLang } from "vuepress/client";

import { useSize } from "../composables/index.js";
import { videoIframeAllow } from "../utils/index.js";

import "../styles/youtube.scss";

export default defineComponent({
  name: "YouTube",

  props: {
    /**
     * YouTube video id
     *
     * YouTube 视频 id
     */
    id: String,

    /**
     * Youtube video title
     *
     * Youtube 视频标题
     */
    title: {
      type: String,
      default: "A YouTube video",
    },

    /**
     * Component width
     *
     * 组件宽度
     */
    width: {
      type: [String, Number],
      default: "100%",
    },

    /**
     * Component height
     *
     * 组件高度
     */
    height: [String, Number],

    /**
     * Component width / height ratio
     *
     * 组件长宽比
     */
    ratio: {
      type: [String, Number],
      default: 16 / 9,
    },

    /**
     * Whether to autoplay the video
     *
     * 是否自动播放视频
     */
    autoplay: Boolean,

    /**
     * Whether to loop the video
     *
     * 是否循环播放视频
     */
    loop: Boolean,

    /**
     * Whether to show cc
     *
     * 是否显示字幕
     */
    showCc: Boolean,

    /**
     * Whether to show annotations
     *
     * 是否显示注释
     */
    showAnnotations: Boolean,

    /**
     * Video start time in seconds
     *
     * 视频开始时间 (秒)
     */
    start: [String, Number],

    /**
     * Video end time in seconds
     *
     * 视频结束时间 (秒)
     */
    end: [String, Number],

    /**
     * Default cc lang
     *
     * 默认字幕语言
     */
    defaultCcLang: String,

    /**
     * UI language
     *
     * UI 语言
     */
    uiLang: String,

    /**
     * List type
     *
     * 列表类型
     */
    listType: String,

    /**
     * List
     *
     * 列表
     */
    list: String,

    /**
     * Playlist id
     *
     * 播放列表 id
     */
    playlist: String,

    /**
     * Whether to disable controls
     *
     * 是否禁用控制
     */
    disableControls: Boolean,

    /**
     * Whether to disable fullscreen
     *
     * 是否禁用全屏
     */
    disableFullscreen: Boolean,

    /**
     * Whether to disable keyboard
     *
     * 是否禁用键盘
     */
    disableKeyboard: Boolean,
  },

  setup(props) {
    const lang = useLang();
    const { el, width, height, resize } = useSize<HTMLIFrameElement>(props);

    const loaded = ref(false);

    const coreURL = computed(() =>
      props.id
        ? `${props.id}?`
        : props.listType === "playlist" && props.list
          ? `?listType=playlist&list=${
              startsWith(props.list, "PL") ? props.list : `PL${props.list}`
            }&`
          : null,
    );

    const params = computed(() => {
      const params = new URLSearchParams();

      if (props.autoplay) params.set("autoplay", "1");
      if (props.loop) params.set("loop", "1");
      if (props.showCc) params.set("cc_load_policy", "1");
      if (props.showAnnotations) params.set("iv_load_policy", "3");

      if (props.start) params.set("start", props.start.toString());
      if (props.end) params.set("end", props.end.toString());

      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      params.set("hl", props.uiLang || lang.value);
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      params.set("cc_lang_pref", props.defaultCcLang || lang.value);
      params.set("color", "white");

      if (props.disableControls) params.set("controls", "0");
      if (props.disableFullscreen) params.set("fs", "0");
      if (props.disableKeyboard) params.set("disablekb", "1");

      if (props.playlist) params.set("playlist", props.playlist);

      return params.toString();
    });

    const videoLink = computed(() =>
      coreURL.value
        ? `https://www.youtube.com/embed/${coreURL.value}${params.value}`
        : null,
    );

    return (): (VNode | null)[] =>
      videoLink.value
        ? [
            h(
              "div",
              { class: "youtube-desc" },
              h("a", { class: "sr-only", href: videoLink.value }, props.title),
            ),
            h("iframe", {
              ref: el,
              src: videoLink.value,
              title: props.title,
              class: "youtube-iframe",
              allow: videoIframeAllow,
              style: {
                width: width.value,
                height: loaded.value ? height.value : 0,
              },
              onLoad: () => {
                loaded.value = true;
                resize();
              },
            }),
            loaded.value ? null : h(LoadingIcon),
          ]
        : [];
  },
});
