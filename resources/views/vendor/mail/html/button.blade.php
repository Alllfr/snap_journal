@props([
    'url',
    'align' => 'center',
])

<table class="action" align="{{ $align }}" width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td align="{{ $align }}">
<table border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td>
<a href="{{ $url }}" 
   class="button" 
   target="_blank" rel="noopener"
   style="background: linear-gradient(90deg, #ff66b2, #6699ff);
          border-radius: 8px;
          padding: 10px 20px;
          color: #fff; text-decoration: none; 
          font-weight: bold; display:inline-block;">
    {{ $slot }}
</a>
</td>
</tr>
</table>
</td>
</tr>
</table>
