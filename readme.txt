=== ACF Content Blocks ===
Contributors: acfcontentblocks
Tags: acf, advanced custom fields, content blocks, drag and drop, page builder
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A custom ACF field type that allows creating mixed content blocks (text, image, video, quote, HTML) with drag & drop reordering. Inspired by Squarespace.

== Description ==

**ACF Content Blocks** extends Advanced Custom Fields with a brand new field type called **Content Blocks**. Think of it as a gallery field, but instead of just images, you can add multiple types of content blocks and reorder them via drag & drop.

= Available Block Types =

* **Text** – Rich text area for paragraphs and formatted content
* **Image** – WordPress media library integration with optional caption
* **Video** – YouTube, Vimeo, or direct video URLs with live preview
* **Quote** – Blockquote with author attribution
* **HTML / Code** – Raw HTML or embed code with syntax-highlighted editor

= Key Features =

* Drag & drop reordering powered by SortableJS
* Clean, modern UI inspired by Squarespace's backend
* Collapse / expand individual blocks
* Duplicate blocks with one click
* Configurable: enable/disable specific block types
* Set minimum and maximum block limits
* Responsive design for mobile editing
* Full WordPress media library integration
* Works with `get_field()` and ACF template functions
* Zero modifications to ACF core – installs as a standalone plugin

= Requirements =

* WordPress 5.8+
* Advanced Custom Fields 5.0+ (free or PRO)
* PHP 7.4+

== Installation ==

1. Upload the `acf-content-blocks` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Make sure ACF is installed and active
4. Create or edit a Field Group in ACF
5. Add a new field and select **Content Blocks** as the field type
6. Configure allowed block types, limits, and display options

== Usage in Templates ==

Use the standard ACF `get_field()` function to retrieve the blocks:

    <?php
    $blocks = get_field( 'my_content_blocks' );

    if ( $blocks ) :
        foreach ( $blocks as $block ) :
            switch ( $block['type'] ) :
                case 'text':
                    echo '<div class="block-text">' . wpautop( $block['content'] ) . '</div>';
                    break;

                case 'image':
                    echo '<figure class="block-image">';
                    echo wp_get_attachment_image( $block['meta']['image_id'], 'large' );
                    if ( ! empty( $block['meta']['caption'] ) ) {
                        echo '<figcaption>' . esc_html( $block['meta']['caption'] ) . '</figcaption>';
                    }
                    echo '</figure>';
                    break;

                case 'video':
                    echo '<div class="block-video">' . wp_oembed_get( $block['content'] ) . '</div>';
                    break;

                case 'quote':
                    echo '<blockquote class="block-quote">';
                    echo '<p>' . esc_html( $block['content'] ) . '</p>';
                    if ( ! empty( $block['meta']['author'] ) ) {
                        echo '<cite>' . esc_html( $block['meta']['author'] ) . '</cite>';
                    }
                    echo '</blockquote>';
                    break;

                case 'html':
                    echo '<div class="block-html">' . $block['content'] . '</div>';
                    break;
            endswitch;
        endforeach;
    endif;
    ?>

== Frequently Asked Questions ==

= Does this modify ACF core? =

No. ACF Content Blocks registers a new custom field type using ACF's official `acf_register_field_type()` API. It does not modify any ACF files.

= Does it work with ACF Free and PRO? =

Yes, it works with both ACF Free (5.0+) and ACF PRO.

= Can I nest Content Blocks inside a Repeater or Flexible Content? =

Yes! Content Blocks is a standard ACF field type and can be used inside repeaters, groups, flexible content layouts, etc.

== Screenshots ==

1. Content Blocks field with mixed content types
2. Drag & drop reordering
3. Field settings in ACF

== Changelog ==

= 1.0.0 =
* Initial release
* Text, Image, Video, Quote, and HTML block types
* Drag & drop reordering with SortableJS
* Collapse, expand, duplicate, and remove blocks
* WordPress media library integration
* Configurable block type restrictions and limits
