@php
$html = Illuminate\Mail\Markdown::parse($slot);
$html = preg_replace_callback('/<a .*?href="(.*?)".*?>(.*?)<\/a>/', function($matches) {
    $href = $matches[1];
    $text = $matches[2];
    return '<a href="' . $href . '" style="color:#000000 !important; text-decoration:none;"><span style="color:#000000 !important;">' . $text . '</span></a>';
}, $html);
$html = preg_replace('/<p /', '<p style="color:#000000 !important; margin:0 0 1em 0;" ', $html);
@endphp

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>{{ config('app.name') }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <style>
        @media only screen and (max-width: 600px) {
            .inner-body { width: 100% !important; }
            .footer { width: 100% !important; }
        }
        @media only screen and (max-width: 500px) {
            .button { width: 100% !important; }
        }
    </style>
    {!! $head ?? '' !!}
</head>
<body style="margin:0; padding:0; background:#ffffff; color:#000000; font-family:Arial, Helvetica, sans-serif;">
    <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;">
        <tr>
            <td align="center" style="background:#ffffff;">
                <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;">
                    {!! $header ?? '' !!}
                    <tr>
                        <td class="body" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; padding:20px;">
                            <table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff; border-radius:10px;">
                                <tr>
                                    <td class="content-cell" style="background:#ffffff; padding:28px; color:#000000; font-size:14px; line-height:1.6;">
                                        {!! $html !!}
                                        {!! $subcopy ?? '' !!}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td class="footer" style="text-align:center; font-size:12px; color:#000000; padding:18px 0; background:#ffffff;">
                            {!! $footer ?? '' !!}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
