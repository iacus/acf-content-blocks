<?php
/**
 * ACF Content Blocks Field Type
 *
 * Registers a custom ACF field that displays mixed content blocks
 * in a visual grid. Double-click any card to edit it in a modal.
 *
 * @package ACF_Content_Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class ACF_Field_Content_Blocks extends acf_field {

    public $name     = 'content_blocks';
    public $label    = 'Content Blocks';
    public $category = 'layout';

    public $defaults = array(
        'block_types'  => array( 'text', 'image', 'video', 'quote', 'html' ),
        'max_blocks'   => 0,
        'min_blocks'   => 0,
        'grid_columns' => 4,
        'button_label' => 'Add Block',
    );

    private $block_definitions = array();

    /* ----------------------------------------------------------
     * Constructor
     * ---------------------------------------------------------- */
    public function __construct() {
        parent::__construct();

        $this->block_definitions = array(
            'text'  => array(
                'label' => __( 'Text', 'acf-content-blocks' ),
                'icon'  => 'dashicons-editor-paragraph',
            ),
            'image' => array(
                'label' => __( 'Image', 'acf-content-blocks' ),
                'icon'  => 'dashicons-format-image',
            ),
            'video' => array(
                'label' => __( 'Video', 'acf-content-blocks' ),
                'icon'  => 'dashicons-video-alt3',
            ),
            'quote' => array(
                'label' => __( 'Quote', 'acf-content-blocks' ),
                'icon'  => 'dashicons-format-quote',
            ),
            'html'  => array(
                'label' => __( 'HTML / Code', 'acf-content-blocks' ),
                'icon'  => 'dashicons-editor-code',
            ),
        );
    }

    /* ----------------------------------------------------------
     * Enqueue
     * ---------------------------------------------------------- */
    public function input_admin_enqueue_scripts() {
        $v   = ACF_CONTENT_BLOCKS_VERSION;
        $url = ACF_CONTENT_BLOCKS_URL;

        wp_enqueue_script( 'sortablejs', 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js', array(), '1.15.6', true );
        wp_enqueue_script( 'acf-content-blocks', $url . 'assets/js/admin.js', array( 'acf-input', 'sortablejs', 'wp-i18n' ), $v, true );
        wp_enqueue_style( 'acf-content-blocks', $url . 'assets/css/admin.css', array( 'acf-input' ), $v );

        wp_localize_script( 'acf-content-blocks', 'acfCB', array(
            'types' => $this->block_definitions,
            'i18n'  => array(
                'addBlock'      => __( 'Add Block', 'acf-content-blocks' ),
                'confirmRemove' => __( 'Are you sure you want to remove this block?', 'acf-content-blocks' ),
                'maxReached'    => __( 'Maximum number of blocks reached.', 'acf-content-blocks' ),
                'selectImage'   => __( 'Select Image', 'acf-content-blocks' ),
                'changeImage'   => __( 'Change Image', 'acf-content-blocks' ),
                'removeImage'   => __( 'Remove Image', 'acf-content-blocks' ),
                'done'          => __( 'Done', 'acf-content-blocks' ),
                'delete'        => __( 'Delete', 'acf-content-blocks' ),
                'duplicate'     => __( 'Duplicate', 'acf-content-blocks' ),
                'cancel'        => __( 'Cancel', 'acf-content-blocks' ),
                'editBlock'     => __( 'Edit Block', 'acf-content-blocks' ),
                'enterText'     => __( 'Write your text here…', 'acf-content-blocks' ),
                'enterUrl'      => __( 'Enter video URL (YouTube, Vimeo, or direct link)', 'acf-content-blocks' ),
                'enterQuote'    => __( 'Write the quote…', 'acf-content-blocks' ),
                'enterAuthor'   => __( 'Author name', 'acf-content-blocks' ),
                'enterHtml'     => __( 'Paste your HTML or embed code…', 'acf-content-blocks' ),
                'caption'       => __( 'Caption (optional)', 'acf-content-blocks' ),
                'noBlocks'      => __( 'No blocks yet', 'acf-content-blocks' ),
                'bulkImages'    => __( 'Multiple Images', 'acf-content-blocks' ),
                'bulkImagesAdd' => __( 'Add Images', 'acf-content-blocks' ),
                'bulkAdded'     => __( '%d image(s) added.', 'acf-content-blocks' ),
                'bulkMaxWarn'   => __( 'Only %d image(s) could be added (max blocks reached).', 'acf-content-blocks' ),
                'text'          => __( 'Text', 'acf-content-blocks' ),
                'image'         => __( 'Image', 'acf-content-blocks' ),
                'video'         => __( 'Video', 'acf-content-blocks' ),
                'quote'         => __( 'Quote', 'acf-content-blocks' ),
                'html'          => __( 'HTML / Code', 'acf-content-blocks' ),
            ),
        ) );

        wp_enqueue_media();
    }

    /* ----------------------------------------------------------
     * Field Settings
     * ---------------------------------------------------------- */
    public function render_field_settings( $field ) {
        acf_render_field_setting( $field, array(
            'label'   => __( 'Allowed Block Types', 'acf-content-blocks' ),
            'type'    => 'checkbox',
            'name'    => 'block_types',
            'choices' => array(
                'text'  => __( 'Text', 'acf-content-blocks' ),
                'image' => __( 'Image', 'acf-content-blocks' ),
                'video' => __( 'Video', 'acf-content-blocks' ),
                'quote' => __( 'Quote', 'acf-content-blocks' ),
                'html'  => __( 'HTML / Code', 'acf-content-blocks' ),
            ),
        ) );

        acf_render_field_setting( $field, array(
            'label' => __( 'Minimum Blocks', 'acf-content-blocks' ),
            'type'  => 'number',
            'name'  => 'min_blocks',
            'min'   => 0,
            'step'  => 1,
        ) );

        acf_render_field_setting( $field, array(
            'label' => __( 'Maximum Blocks', 'acf-content-blocks' ),
            'type'  => 'number',
            'name'  => 'max_blocks',
            'min'   => 0,
            'step'  => 1,
        ) );

        acf_render_field_setting( $field, array(
            'label'   => __( 'Grid Columns', 'acf-content-blocks' ),
            'instructions' => __( 'Number of columns in the grid (2–6).', 'acf-content-blocks' ),
            'type'    => 'number',
            'name'    => 'grid_columns',
            'min'     => 2,
            'max'     => 6,
            'step'    => 1,
        ) );

        acf_render_field_setting( $field, array(
            'label'       => __( 'Button Label', 'acf-content-blocks' ),
            'type'        => 'text',
            'name'        => 'button_label',
            'placeholder' => __( 'Add Block', 'acf-content-blocks' ),
        ) );
    }

    /* ----------------------------------------------------------
     * Render Field (Grid + Modal shell)
     * ---------------------------------------------------------- */
    public function render_field( $field ) {
        $value       = is_array( $field['value'] ) ? $field['value'] : array();
        $block_types = is_array( $field['block_types'] ) ? $field['block_types'] : $this->defaults['block_types'];
        $max         = intval( $field['max_blocks'] );
        $min         = intval( $field['min_blocks'] );
        $cols        = max( 2, min( 6, intval( $field['grid_columns'] ) ) );

        $field_id   = esc_attr( $field['id'] );
        $field_name = esc_attr( $field['name'] );
        ?>
        <div
            class="acf-content-blocks-field"
            data-field-id="<?php echo $field_id; ?>"
            data-field-name="<?php echo $field_name; ?>"
            data-max="<?php echo esc_attr( $max ); ?>"
            data-min="<?php echo esc_attr( $min ); ?>"
            data-cols="<?php echo esc_attr( $cols ); ?>"
            data-allowed='<?php echo wp_json_encode( $block_types ); ?>'
        >
            <input
                type="hidden"
                name="<?php echo esc_attr( $field['name'] ); ?>"
                value="<?php echo esc_attr( wp_json_encode( $value ) ); ?>"
                class="acf-cb-value"
            />

            <!-- ===== Grid ===== -->
            <div class="acf-cb-grid" style="--cb-cols:<?php echo $cols; ?>">
                <?php
                if ( ! empty( $value ) ) {
                    foreach ( $value as $i => $block ) {
                        $this->render_card( $block, $i );
                    }
                }
                ?>

                <!-- Add-block card (always last) -->
                <div class="acf-cb-card acf-cb-card--add">
                    <button type="button" class="acf-cb-add-trigger" aria-label="<?php esc_attr_e( 'Add Block', 'acf-content-blocks' ); ?>">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="14" y1="6" x2="14" y2="22"/><line x1="6" y1="14" x2="22" y2="14"/></svg>
                    </button>
                    <!-- Type picker popover -->
                    <div class="acf-cb-type-picker" style="display:none">
                        <?php foreach ( $block_types as $type ) :
                            if ( ! isset( $this->block_definitions[ $type ] ) ) continue;
                            $def = $this->block_definitions[ $type ];
                        ?>
                            <button type="button" class="acf-cb-type-btn" data-type="<?php echo esc_attr( $type ); ?>">
                                <span class="dashicons <?php echo esc_attr( $def['icon'] ); ?>"></span>
                                <span><?php echo esc_html( $def['label'] ); ?></span>
                            </button>
                        <?php endforeach; ?>
                        <?php if ( in_array( 'image', $block_types, true ) ) : ?>
                            <div class="acf-cb-type-picker-sep"></div>
                            <button type="button" class="acf-cb-type-btn acf-cb-type-btn--bulk-images" data-type="bulk_images">
                                <span class="dashicons dashicons-images-alt2"></span>
                                <span><?php esc_html_e( 'Multiple Images', 'acf-content-blocks' ); ?></span>
                            </button>
                        <?php endif; ?>
                    </div>
                </div>
            </div>

            <!-- ===== Modal (single, reused) ===== -->
            <div class="acf-cb-modal-overlay" style="display:none">
                <div class="acf-cb-modal">
                    <div class="acf-cb-modal-header">
                        <span class="acf-cb-modal-type-icon"></span>
                        <span class="acf-cb-modal-title"><?php esc_html_e( 'Edit Block', 'acf-content-blocks' ); ?></span>
                        <button type="button" class="acf-cb-modal-close" aria-label="Close">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>
                        </button>
                    </div>
                    <div class="acf-cb-modal-body"></div>
                    <div class="acf-cb-modal-footer">
                        <button type="button" class="button acf-cb-modal-delete"><?php esc_html_e( 'Delete', 'acf-content-blocks' ); ?></button>
                        <button type="button" class="button acf-cb-modal-duplicate"><?php esc_html_e( 'Duplicate', 'acf-content-blocks' ); ?></button>
                        <button type="button" class="button button-primary acf-cb-modal-done"><?php esc_html_e( 'Done', 'acf-content-blocks' ); ?></button>
                    </div>
                </div>
            </div>

        </div>
        <?php
    }

    /* ----------------------------------------------------------
     * Render a single grid card (preview thumbnail)
     * ---------------------------------------------------------- */
    private function render_card( $block, $index ) {
        $type    = isset( $block['type'] ) ? $block['type'] : 'text';
        $content = isset( $block['content'] ) ? $block['content'] : '';
        $meta    = isset( $block['meta'] ) ? $block['meta'] : array();
        $def     = isset( $this->block_definitions[ $type ] ) ? $this->block_definitions[ $type ] : $this->block_definitions['text'];

        // Build a preview string / thumbnail URL.
        $thumb_url = '';
        $preview   = '';

        switch ( $type ) {
            case 'text':
                $preview = wp_trim_words( wp_strip_all_tags( $content ), 12, '…' );
                break;
            case 'image':
                $id = ! empty( $meta['image_id'] ) ? intval( $meta['image_id'] ) : 0;
                if ( $id ) {
                    $thumb_url = wp_get_attachment_image_url( $id, 'medium' );
                }
                $preview = isset( $meta['caption'] ) ? $meta['caption'] : '';
                break;
            case 'video':
                // Try to get a YouTube thumbnail.
                if ( preg_match( '/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/', $content, $m ) ) {
                    $thumb_url = 'https://img.youtube.com/vi/' . $m[1] . '/mqdefault.jpg';
                }
                $preview = $content;
                break;
            case 'quote':
                $preview = wp_trim_words( $content, 10, '…' );
                break;
            case 'html':
                $preview = wp_trim_words( wp_strip_all_tags( $content ), 10, '…' );
                break;
        }
        ?>
        <div
            class="acf-cb-card"
            data-type="<?php echo esc_attr( $type ); ?>"
            data-index="<?php echo esc_attr( $index ); ?>"
            data-block='<?php echo esc_attr( wp_json_encode( $block ) ); ?>'
        >
            <div class="acf-cb-card-inner">
                <?php if ( $thumb_url ) : ?>
                    <img class="acf-cb-card-thumb" src="<?php echo esc_url( $thumb_url ); ?>" alt="" loading="lazy" />
                <?php else : ?>
                    <div class="acf-cb-card-icon">
                        <span class="dashicons <?php echo esc_attr( $def['icon'] ); ?>"></span>
                    </div>
                <?php endif; ?>
                <div class="acf-cb-card-label">
                    <span class="acf-cb-card-type"><?php echo esc_html( $def['label'] ); ?></span>
                    <?php if ( $preview ) : ?>
                        <span class="acf-cb-card-preview"><?php echo esc_html( $preview ); ?></span>
                    <?php endif; ?>
                </div>
            </div>
            <span class="acf-cb-card-drag" title="<?php esc_attr_e( 'Drag to reorder', 'acf-content-blocks' ); ?>">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="3" r="1.2"/><circle cx="11" cy="3" r="1.2"/><circle cx="5" cy="8" r="1.2"/><circle cx="11" cy="8" r="1.2"/><circle cx="5" cy="13" r="1.2"/><circle cx="11" cy="13" r="1.2"/></svg>
            </span>
        </div>
        <?php
    }

    /* ----------------------------------------------------------
     * Video embed helper (used server-side for initial render)
     * ---------------------------------------------------------- */
    private function get_video_embed( $url ) {
        if ( preg_match( '/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/', $url, $m ) ) {
            return '<iframe src="https://www.youtube.com/embed/' . esc_attr( $m[1] ) . '" frameborder="0" allowfullscreen style="width:100%;aspect-ratio:16/9;"></iframe>';
        }
        if ( preg_match( '/vimeo\.com\/(\d+)/', $url, $m ) ) {
            return '<iframe src="https://player.vimeo.com/video/' . esc_attr( $m[1] ) . '" frameborder="0" allowfullscreen style="width:100%;aspect-ratio:16/9;"></iframe>';
        }
        return '<video src="' . esc_url( $url ) . '" controls style="width:100%;max-height:300px;"></video>';
    }

    /* ----------------------------------------------------------
     * Validate
     * ---------------------------------------------------------- */
    public function validate_value( $valid, $value, $field, $input ) {
        $blocks = json_decode( $value, true );
        $blocks = is_array( $blocks ) ? $blocks : array();
        $count  = count( $blocks );
        $min    = intval( $field['min_blocks'] );
        $max    = intval( $field['max_blocks'] );

        if ( $min > 0 && $count < $min ) {
            return sprintf( __( 'This field requires at least %d block(s).', 'acf-content-blocks' ), $min );
        }
        if ( $max > 0 && $count > $max ) {
            return sprintf( __( 'This field allows a maximum of %d block(s).', 'acf-content-blocks' ), $max );
        }
        return $valid;
    }

    /* ----------------------------------------------------------
     * Save
     * ---------------------------------------------------------- */
    public function update_value( $value, $post_id, $field ) {
        $blocks = json_decode( wp_unslash( $value ), true );
        if ( ! is_array( $blocks ) ) return array();

        $clean = array();
        foreach ( $blocks as $block ) {
            $type    = isset( $block['type'] ) ? sanitize_key( $block['type'] ) : 'text';
            $content = isset( $block['content'] ) ? $block['content'] : '';
            $meta    = isset( $block['meta'] ) && is_array( $block['meta'] ) ? $block['meta'] : array();

            switch ( $type ) {
                case 'text':
                    $content = wp_kses_post( $content );
                    break;
                case 'image':
                    $content = '';
                    $meta['image_id'] = isset( $meta['image_id'] ) ? absint( $meta['image_id'] ) : 0;
                    $meta['caption']  = isset( $meta['caption'] ) ? sanitize_text_field( $meta['caption'] ) : '';
                    break;
                case 'video':
                    $content = esc_url_raw( $content );
                    $meta['caption'] = isset( $meta['caption'] ) ? sanitize_text_field( $meta['caption'] ) : '';
                    break;
                case 'quote':
                    $content = sanitize_textarea_field( $content );
                    $meta['author'] = isset( $meta['author'] ) ? sanitize_text_field( $meta['author'] ) : '';
                    break;
                case 'html':
                    break;
                default:
                    continue 2;
            }

            $clean[] = array( 'type' => $type, 'content' => $content, 'meta' => $meta );
        }
        return $clean;
    }

    /* ----------------------------------------------------------
     * Format for get_field()
     * ---------------------------------------------------------- */
    public function format_value( $value, $post_id, $field ) {
        if ( empty( $value ) || ! is_array( $value ) ) return array();

        foreach ( $value as &$block ) {
            if ( 'image' === $block['type'] && ! empty( $block['meta']['image_id'] ) ) {
                $id = intval( $block['meta']['image_id'] );
                $block['meta']['image_url']   = wp_get_attachment_url( $id );
                $block['meta']['image_srcset'] = wp_get_attachment_image_srcset( $id, 'full' );
                $block['meta']['image_sizes']  = wp_get_attachment_image_sizes( $id, 'full' );
                $block['meta']['image_alt']    = get_post_meta( $id, '_wp_attachment_image_alt', true );
            }
        }
        return $value;
    }
}
