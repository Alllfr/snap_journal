<?php

if (!function_exists('aiFormat')) {

    function aiFormat(string $text): string
    {
        if (!$text) return "";

        $text = preg_replace('/<(b|strong)>(.*?)<\/(b|strong)>/i', '**$2**', $text);
        $text = preg_replace('/<(i|em)>(.*?)<\/(i|em)>/i', '*$2*', $text);
        $text = preg_replace('/<li[^>]*>(.*?)<\/li>/i', "• $1\n", $text);
        $text = preg_replace('/<\/?(ul|ol)[^>]*>/i', '', $text);
        $text = preg_replace('/<p[^>]*>(.*?)<\/p>/i', "$1\n\n", $text);
        $text = preg_replace('/<br\s*\/?>/i', "\n", $text);
        $text = strip_tags($text);
        $text = preg_replace('/[ \t]+/', ' ', $text);
        $text = preg_replace("/\n{3,}/", "\n\n", $text);

        return trim($text);
    }

}
