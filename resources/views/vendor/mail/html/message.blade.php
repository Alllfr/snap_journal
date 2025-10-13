@component('mail::layout')
    @slot('header')
        @component('mail::header')
            {{ $header ?? config('app.name') }}
        @endcomponent
    @endslot

    {{ $slot }}

    @isset($subcopy)
        @slot('subcopy')
            @component('mail::subcopy')
                {{ $subcopy }}
            @endcomponent
        @endslot
    @endisset

    @slot('footer')
        @component('mail::footer')
            {{ $footer ?? ('© ' . date('Y') . ' Snap Journal. All rights reserved.') }}
        @endcomponent
    @endslot
@endcomponent
