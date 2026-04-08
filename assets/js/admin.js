/**
 * ACF Content Blocks – Admin JS (v2 – Grid + Modal)
 *
 * Cards live in a CSS-grid, sorted via SortableJS.
 * Double-click (or tap) a card → opens a modal to edit.
 * The "+" card shows a type-picker popover.
 */
(function ($) {
  "use strict";
  if (typeof acf === "undefined") return;

  var I = acfCB.i18n;
  var TYPES = acfCB.types;

  /* ==============================================================
   * Helpers
   * ============================================================== */
  function uid() {
    return "cb_" + Math.random().toString(36).substr(2, 9);
  }

  function truncate(s, n) {
    s = (s || "").replace(/<[^>]+>/g, "").trim();
    return s.length > n ? s.substring(0, n) + "…" : s;
  }

  function videoEmbed(url) {
    if (!url) return "";
    var m;
    m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (m) return '<iframe src="https://www.youtube.com/embed/' + m[1] + '" frameborder="0" allowfullscreen style="width:100%;aspect-ratio:16/9;border-radius:8px;"></iframe>';
    m = url.match(/vimeo\.com\/(\d+)/);
    if (m) return '<iframe src="https://player.vimeo.com/video/' + m[1] + '" frameborder="0" allowfullscreen style="width:100%;aspect-ratio:16/9;border-radius:8px;"></iframe>';
    return '<video src="' + url + '" controls style="width:100%;max-height:320px;border-radius:8px;"></video>';
  }

  function ytThumb(url) {
    var m = (url || "").match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return m ? "https://img.youtube.com/vi/" + m[1] + "/mqdefault.jpg" : "";
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var ctx = this, a = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, a); }, ms);
    };
  }

  /* ==============================================================
   * Build a grid card element from block data
   * ============================================================== */
  function buildCard(block) {
    var type = block.type || "text";
    var def = TYPES[type] || TYPES.text;
    var content = block.content || "";
    var meta = block.meta || {};

    var thumbHtml = "";
    var preview = "";

    switch (type) {
      case "text":
        preview = truncate(content, 40);
        break;
      case "image":
        if (meta.image_url) {
          thumbHtml = '<img class="acf-cb-card-thumb" src="' + meta.image_url + '" alt="" loading="lazy"/>';
        } else if (meta.image_id && parseInt(meta.image_id)) {
          // We'll set the src via JS after creation if needed
          thumbHtml = '<img class="acf-cb-card-thumb" src="" alt="" loading="lazy" data-needs-src="1"/>';
        }
        preview = meta.caption || "";
        break;
      case "video":
        var yt = ytThumb(content);
        if (yt) thumbHtml = '<img class="acf-cb-card-thumb" src="' + yt + '" alt="" loading="lazy"/>';
        preview = truncate(content, 30);
        break;
      case "quote":
        preview = truncate(content, 30);
        if (meta.author) preview += " — " + meta.author;
        break;
      case "html":
        preview = truncate(content, 30);
        break;
    }

    var iconFallback = !thumbHtml
      ? '<div class="acf-cb-card-icon"><span class="dashicons ' + def.icon + '"></span></div>'
      : "";

    var previewLine = preview
      ? '<span class="acf-cb-card-preview">' + $("<span/>").text(preview).html() + "</span>"
      : "";

    var html =
      '<div class="acf-cb-card" data-type="' + type + '" data-uid="' + uid() + '"' +
      " data-block='" + $("<div/>").text(JSON.stringify(block)).html() + "'>" +
        '<div class="acf-cb-card-inner">' +
          thumbHtml +
          iconFallback +
          '<div class="acf-cb-card-label">' +
            '<span class="acf-cb-card-type">' + def.label + "</span>" +
            previewLine +
          "</div>" +
        "</div>" +
        '<span class="acf-cb-card-drag" title="Drag to reorder">' +
          '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="3" r="1.2"/><circle cx="11" cy="3" r="1.2"/><circle cx="5" cy="8" r="1.2"/><circle cx="11" cy="8" r="1.2"/><circle cx="5" cy="13" r="1.2"/><circle cx="11" cy="13" r="1.2"/></svg>' +
        "</span>" +
      "</div>";

    return $(html);
  }

  /* ==============================================================
   * Sync: read data-block from every card → write JSON to hidden input
   * ============================================================== */
  function sync($field) {
    var blocks = [];
    $field.find(".acf-cb-grid > .acf-cb-card:not(.acf-cb-card--add)").each(function () {
      var raw = $(this).attr("data-block");
      try { blocks.push(JSON.parse(raw)); } catch (e) {}
    });
    $field.find(".acf-cb-value").val(JSON.stringify(blocks));
  }

  /* ==============================================================
   * Modal: populate body depending on block type
   * ============================================================== */
  function modalBodyHtml(block) {
    var type = block.type || "text";
    var content = block.content || "";
    var meta = block.meta || {};
    var h = "";

    switch (type) {
      case "text":
        h += '<textarea class="acf-cb-m-input acf-cb-m-text" placeholder="' + I.enterText + '" rows="8">' + escHtml(content) + "</textarea>";
        break;

      case "image":
        var imgId = meta.image_id ? parseInt(meta.image_id) : 0;
        var imgUrl = meta.image_url || "";
        h += '<div class="acf-cb-m-image" data-image-id="' + imgId + '">';
        h += '  <div class="acf-cb-m-image-preview' + (imgUrl ? " has-image" : "") + '">';
        if (imgUrl) h += '    <img src="' + imgUrl + '" alt=""/>';
        h += '    <div class="acf-cb-m-image-empty"><span class="dashicons dashicons-format-image"></span><span>' + I.selectImage + "</span></div>";
        h += "  </div>";
        h += '  <div class="acf-cb-m-image-btns">';
        h += '    <button type="button" class="button acf-cb-m-pick-image">' + (imgUrl ? I.changeImage : I.selectImage) + "</button>";
        h += '    <button type="button" class="button acf-cb-m-remove-image"' + (!imgUrl ? ' style="display:none"' : "") + ">" + I.removeImage + "</button>";
        h += "  </div>";
        h += '  <input type="text" class="acf-cb-m-input acf-cb-m-caption" placeholder="' + I.caption + '" value="' + escAttr(meta.caption || "") + '"/>';
        h += "</div>";
        break;

      case "video":
        var videoId = meta.video_id ? parseInt(meta.video_id) : 0;
        h += '<input type="url" class="acf-cb-m-input acf-cb-m-video-url" placeholder="' + I.enterUrl + '" value="' + escAttr(content) + '"/>';
        h += '<div class="acf-cb-m-image acf-cb-m-video" data-video-id="' + videoId + '">';
        h += '  <div class="acf-cb-m-image-btns">';
        h += '    <button type="button" class="button acf-cb-m-pick-video">' + (videoId ? I.changeVideo : I.selectVideo) + "</button>";
        h += '    <button type="button" class="button acf-cb-m-remove-video"' + (!videoId ? ' style="display:none"' : "") + ">" + I.removeVideo + "</button>";
        h += "  </div>";
        h += "</div>";
        h += '<div class="acf-cb-m-video-preview">' + videoEmbed(content) + "</div>";
        h += '<input type="text" class="acf-cb-m-input acf-cb-m-caption" placeholder="' + I.caption + '" value="' + escAttr(meta.caption || "") + '"/>';
        break;

      case "quote":
        h += '<div class="acf-cb-m-quote-wrap">';
        h += '<textarea class="acf-cb-m-input acf-cb-m-quote" placeholder="' + I.enterQuote + '" rows="5">' + escHtml(content) + "</textarea>";
        h += '<input type="text" class="acf-cb-m-input acf-cb-m-author" placeholder="' + I.enterAuthor + '" value="' + escAttr(meta.author || "") + '"/>';
        h += "</div>";
        break;

      case "html":
        h += '<textarea class="acf-cb-m-input acf-cb-m-html" placeholder="' + I.enterHtml + '" rows="10" spellcheck="false">' + escHtml(content) + "</textarea>";
        break;
    }
    return h;
  }

  /** Read current modal fields back into a block object. */
  function readModal($modal, type) {
    var data = { type: type, content: "", meta: {} };
    switch (type) {
      case "text":
        data.content = $modal.find(".acf-cb-m-text").val() || "";
        break;
      case "image":
        var $img = $modal.find(".acf-cb-m-image");
        data.meta.image_id = parseInt($img.data("image-id") || 0);
        data.meta.image_url = $img.find(".acf-cb-m-image-preview img").attr("src") || "";
        data.meta.caption = $modal.find(".acf-cb-m-caption").val() || "";
        break;
      case "video":
        data.content = $modal.find(".acf-cb-m-video-url").val() || "";
        data.meta.video_id = parseInt($modal.find(".acf-cb-m-video").data("video-id") || 0);
        data.meta.caption = $modal.find(".acf-cb-m-caption").val() || "";
        break;
      case "quote":
        data.content = $modal.find(".acf-cb-m-quote").val() || "";
        data.meta.author = $modal.find(".acf-cb-m-author").val() || "";
        break;
      case "html":
        data.content = $modal.find(".acf-cb-m-html").val() || "";
        break;
    }
    return data;
  }

  function escHtml(s) {
    return $("<div/>").text(s).html();
  }
  function escAttr(s) {
    return $("<div/>").text(s).html().replace(/"/g, "&quot;");
  }

  /* ==============================================================
   * Refresh a card's visual preview after modal edit
   * ============================================================== */
  function refreshCard($card, block) {
    var $new = buildCard(block);
    $card.replaceWith($new);
    return $new;
  }

  /* ==============================================================
   * Check max
   * ============================================================== */
  function checkMax($field) {
    var max = parseInt($field.data("max"), 10);
    if (!max) return true;
    var count = $field.find(".acf-cb-grid > .acf-cb-card:not(.acf-cb-card--add)").length;
    if (count >= max) {
      alert(I.maxReached);
      return false;
    }
    return true;
  }

  /* ==============================================================
   * Init a single field instance
   * ============================================================== */
  function initField($field) {
    var $grid = $field.find(".acf-cb-grid");
    var $overlay = $field.find(".acf-cb-modal-overlay");
    var $modal = $field.find(".acf-cb-modal");
    var activeCard = null; // jQuery ref to the card being edited

    /* ---------- Sortable on grid ---------- */
    if ($grid.length && typeof Sortable !== "undefined") {
      Sortable.create($grid[0], {
        handle: ".acf-cb-card-drag",
        animation: 200,
        ghostClass: "acf-cb-ghost",
        chosenClass: "acf-cb-chosen",
        dragClass: "acf-cb-dragging",
        filter: ".acf-cb-card--add",
        onEnd: function () { sync($field); },
      });
    }

    /* ---------- Type picker (add card) ---------- */
    var $addCard = $grid.find(".acf-cb-card--add");
    var $picker = $addCard.find(".acf-cb-type-picker");

    $addCard.find(".acf-cb-add-trigger").on("click", function (e) {
      e.stopPropagation();
      if ($picker.is(":visible")) {
        $picker.hide();
      } else {
        $picker.css("display", "flex");
      }
    });

    $picker.on("click", ".acf-cb-type-btn", function (e) {
      e.stopPropagation();
      var type = $(this).data("type");

      // Bulk images: open media gallery with multi-select.
      if (type === "bulk_images") {
        $picker.hide();
        openBulkImagePicker($field, $addCard);
        return;
      }

      if (!checkMax($field)) return;

      var block = { type: type, content: "", meta: {} };
      var $card = buildCard(block);

      $addCard.before($card);
      $picker.hide();
      sync($field);

      // Open modal immediately for editing.
      openModal($card);
    });

    // Close picker when clicking outside.
    $(document).on("click", function () { $picker.hide(); });

    /* ---------- Double-click / tap → open modal ---------- */
    $grid.on("dblclick", ".acf-cb-card:not(.acf-cb-card--add)", function () {
      openModal($(this));
    });

    // Single click also opens (more mobile-friendly, like Squarespace).
    var clickTimer = null;
    $grid.on("click", ".acf-cb-card:not(.acf-cb-card--add)", function (e) {
      // Ignore if dragging.
      if ($(e.target).closest(".acf-cb-card-drag").length) return;
      var $card = $(this);
      // Use a small delay to differentiate from drag.
      clearTimeout(clickTimer);
      clickTimer = setTimeout(function () {
        openModal($card);
      }, 220);
    });

    // Cancel single-click on double-click.
    $grid.on("dblclick", ".acf-cb-card:not(.acf-cb-card--add)", function () {
      clearTimeout(clickTimer);
    });

    /* ---------- Open modal ---------- */
    function openModal($card) {
      activeCard = $card;
      var block;
      try { block = JSON.parse($card.attr("data-block")); } catch (e) { block = { type: "text", content: "", meta: {} }; }

      var type = block.type || "text";
      var def = TYPES[type] || TYPES.text;

      // Header.
      $modal.find(".acf-cb-modal-type-icon").html('<span class="dashicons ' + def.icon + '"></span>');
      $modal.find(".acf-cb-modal-title").text(def.label);

      // Body.
      $modal.find(".acf-cb-modal-body").html(modalBodyHtml(block));

      // Show.
      $overlay.stop(true).fadeIn(200);
      $("body").addClass("acf-cb-modal-open");

      // Focus first input.
      setTimeout(function () {
        $modal.find("textarea, input[type=url], input[type=text]").first().focus();
      }, 250);

      // Bind live video preview.
      $modal.find(".acf-cb-m-video-url").on("input", debounce(function () {
        $modal.find(".acf-cb-m-video").data("video-id", 0);
        $modal.find(".acf-cb-m-pick-video").text(I.selectVideo);
        $modal.find(".acf-cb-m-remove-video").hide();
        $modal.find(".acf-cb-m-video-preview").html(videoEmbed($(this).val()));
      }, 500));

      // Image picker.
      bindImagePicker($modal, $field);
      bindVideoPicker($modal);
    }

    /* ---------- Close modal → save back to card ---------- */
    function closeModal() {
      if (!activeCard) return;
      var type = activeCard.data("type");
      var block = readModal($modal, type);

      activeCard.attr("data-block", JSON.stringify(block));
      var $fresh = refreshCard(activeCard, block);
      activeCard = $fresh;

      $overlay.stop(true).fadeOut(150);
      $("body").removeClass("acf-cb-modal-open");
      sync($field);
      activeCard = null;
    }

    $overlay.on("click", function (e) {
      if ($(e.target).is($overlay)) closeModal();
    });
    $modal.find(".acf-cb-modal-close, .acf-cb-modal-done").on("click", closeModal);

    // Escape key.
    $(document).on("keydown.acfcb", function (e) {
      if (e.key === "Escape" && $overlay.is(":visible")) closeModal();
    });

    /* ---------- Delete from modal ---------- */
    $modal.find(".acf-cb-modal-delete").on("click", function () {
      if (!activeCard) return;
      if (!confirm(I.confirmRemove)) return;
      activeCard.remove();
      $overlay.stop(true).fadeOut(150);
      $("body").removeClass("acf-cb-modal-open");
      activeCard = null;
      sync($field);
    });

    /* ---------- Duplicate from modal ---------- */
    $modal.find(".acf-cb-modal-duplicate").on("click", function () {
      if (!activeCard) return;
      if (!checkMax($field)) return;

      var type = activeCard.data("type");
      var block = readModal($modal, type);
      var $clone = buildCard(block);

      activeCard.after($clone);
      closeModal();
      sync($field);
    });
  }

  /* ==============================================================
   * Image picker (inside modal)
   * ============================================================== */
  function bindImagePicker($modal) {
    $modal.find(".acf-cb-m-pick-image, .acf-cb-m-image-preview").off("click.acfcb").on("click.acfcb", function (e) {
      e.preventDefault();
      var $wrap = $modal.find(".acf-cb-m-image");

      var frame = wp.media({
        title: acfCB.i18n.selectImage,
        multiple: false,
        library: { type: "image" },
        button: { text: acfCB.i18n.selectImage },
      });

      frame.on("select", function () {
        var att = frame.state().get("selection").first().toJSON();
        var url = att.sizes && att.sizes.medium ? att.sizes.medium.url : att.url;
        $wrap.data("image-id", att.id);
        var $prev = $wrap.find(".acf-cb-m-image-preview").addClass("has-image");
        $prev.find("img").remove();
        $prev.prepend('<img src="' + url + '" alt=""/>');
        $wrap.find(".acf-cb-m-pick-image").text(acfCB.i18n.changeImage);
        $wrap.find(".acf-cb-m-remove-image").show();
      });

      frame.open();
    });

    $modal.find(".acf-cb-m-remove-image").off("click.acfcb").on("click.acfcb", function (e) {
      e.preventDefault();
      var $wrap = $modal.find(".acf-cb-m-image");
      $wrap.data("image-id", 0);
      $wrap.find(".acf-cb-m-image-preview").removeClass("has-image").find("img").remove();
      $wrap.find(".acf-cb-m-pick-image").text(acfCB.i18n.selectImage);
      $(this).hide();
    });
  }

  /* ==============================================================
   * Video picker (inside modal)
   * ============================================================== */
  function bindVideoPicker($modal) {
    $modal.find(".acf-cb-m-pick-video").off("click.acfcb").on("click.acfcb", function (e) {
      e.preventDefault();
      var $wrap = $modal.find(".acf-cb-m-video");

      var frame = wp.media({
        title: I.selectVideo,
        multiple: false,
        library: { type: "video" },
        button: { text: I.selectVideo },
      });

      frame.on("select", function () {
        var att = frame.state().get("selection").first().toJSON();
        var url = att.url || "";
        $wrap.data("video-id", att.id || 0);
        $modal.find(".acf-cb-m-video-url").val(url).trigger("input");
        $wrap.find(".acf-cb-m-pick-video").text(I.changeVideo);
        $wrap.find(".acf-cb-m-remove-video").show();
      });

      frame.open();
    });

    $modal.find(".acf-cb-m-remove-video").off("click.acfcb").on("click.acfcb", function (e) {
      e.preventDefault();
      var $wrap = $modal.find(".acf-cb-m-video");
      $wrap.data("video-id", 0);
      $modal.find(".acf-cb-m-video-url").val("").trigger("input");
      $wrap.find(".acf-cb-m-pick-video").text(I.selectVideo);
      $(this).hide();
    });
  }

  /* ==============================================================
   * Bulk image picker – open media gallery with multi-select
   * ============================================================== */
  function openBulkImagePicker($field, $addCard) {
    var max = parseInt($field.data("max"), 10) || 0;

    var frame = wp.media({
      title: I.bulkImages || "Multiple Images",
      multiple: true,
      library: { type: "image" },
      button: { text: I.bulkImagesAdd || "Add Images" },
    });

    frame.on("select", function () {
      var attachments = frame.state().get("selection").toJSON();
      if (!attachments.length) return;

      // Calculate how many we can actually add.
      var currentCount = $field.find(".acf-cb-grid > .acf-cb-card:not(.acf-cb-card--add)").length;
      var available = max > 0 ? max - currentCount : attachments.length;
      var toAdd = Math.min(attachments.length, available);

      if (toAdd <= 0) {
        alert(I.maxReached);
        return;
      }

      for (var i = 0; i < toAdd; i++) {
        var att = attachments[i];
        var url = att.sizes && att.sizes.medium ? att.sizes.medium.url : att.url;
        var block = {
          type: "image",
          content: "",
          meta: {
            image_id: att.id,
            image_url: url,
            caption: "",
          },
        };
        var $card = buildCard(block);
        $addCard.before($card);
      }

      sync($field);

      // Warn if we couldn't add all of them.
      if (toAdd < attachments.length) {
        alert((I.bulkMaxWarn || "Only %d image(s) could be added (max blocks reached).").replace("%d", toAdd));
      }
    });

    frame.open();
  }

  /* ==============================================================
   * ACF hooks – compatible with ACF 5.x (jQuery) & 5.7+/6.x (Field object)
   * ============================================================== */

  /**
   * Safely resolve the .acf-content-blocks-field element regardless of
   * whether ACF passes a jQuery element (old) or a Field model (new).
   */
  function resolveField(fieldOrEl) {
    // ACF 5.7+ / 6.x: field model with .$el jQuery wrapper
    if (fieldOrEl && fieldOrEl.$el) {
      return fieldOrEl.$el.find(".acf-content-blocks-field").first();
    }
    // ACF < 5.7: plain jQuery element
    if (fieldOrEl && fieldOrEl.find) {
      return fieldOrEl.find(".acf-content-blocks-field").first();
    }
    return $();
  }

  function maybeInit() {
    $(".acf-content-blocks-field").each(function () {
      var $f = $(this);
      if ($f.data("cb-init")) return;     // already initialised
      $f.data("cb-init", true);
      initField($f);
    });
  }

  if (typeof acf.add_action !== "undefined") {
    // Primary: field-specific hooks (covers both ACF versions).
    acf.add_action("ready_field/type=content_blocks", function (field) {
      var $f = resolveField(field);
      if ($f.length && !$f.data("cb-init")) {
        $f.data("cb-init", true);
        initField($f);
      }
    });
    acf.add_action("append_field/type=content_blocks", function (field) {
      var $f = resolveField(field);
      if ($f.length && !$f.data("cb-init")) {
        $f.data("cb-init", true);
        initField($f);
      }
    });

    // Fallback: global ready — catches any field the specific hooks may miss.
    acf.add_action("ready", function () {
      maybeInit();
    });
    acf.add_action("append", function () {
      maybeInit();
    });
  }
})(jQuery);
