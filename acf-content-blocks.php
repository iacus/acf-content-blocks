<?php
/**
 * Plugin Name: ACF Content Blocks
 * Plugin URI: https://github.com/acf-content-blocks
 * Description: A powerful ACF field type that allows creating mixed content blocks (text, image, video, quote, HTML) with drag & drop reordering. Inspired by Squarespace's content editor.
 * Version: 1.0.0
 * Author: ACF Content Blocks
 * Author URI: https://github.com/acf-content-blocks
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: acf-content-blocks
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'ACF_CONTENT_BLOCKS_VERSION', '1.0.0' );
define( 'ACF_CONTENT_BLOCKS_PATH', plugin_dir_path( __FILE__ ) );
define( 'ACF_CONTENT_BLOCKS_URL', plugin_dir_url( __FILE__ ) );

/**
 * Register the ACF field type once ACF is loaded.
 */
function acf_content_blocks_register_field() {
    if ( ! function_exists( 'acf_register_field_type' ) ) {
        return;
    }

    require_once ACF_CONTENT_BLOCKS_PATH . 'includes/class-acf-field-content-blocks.php';
    acf_register_field_type( 'ACF_Field_Content_Blocks' );
}
add_action( 'acf/include_field_types', 'acf_content_blocks_register_field' );

/**
 * Show admin notice if ACF is not active.
 */
function acf_content_blocks_admin_notice() {
    if ( function_exists( 'acf' ) ) {
        return;
    }
    ?>
    <div class="notice notice-error">
        <p>
            <strong><?php esc_html_e( 'ACF Content Blocks', 'acf-content-blocks' ); ?></strong>:
            <?php esc_html_e( 'This plugin requires Advanced Custom Fields (ACF) to be installed and activated.', 'acf-content-blocks' ); ?>
        </p>
    </div>
    <?php
}
add_action( 'admin_notices', 'acf_content_blocks_admin_notice' );
