<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

class AutoTranslateLang extends Command
{
    /**
     * Command signature.
     * Usage example:
     * php artisan lang:auto-translate en id
     */
    protected $signature = 'lang:auto-translate {from=en} {to=id}';

    protected $description = 'Automatically translate Laravel language files from one locale to another.';

    public function handle()
    {
        $from = $this->argument('from');
        $to = $this->argument('to');

        $sourcePath = base_path("lang/{$from}/messages.php");
        $targetDir = base_path("lang/{$to}");
        $targetPath = "{$targetDir}/messages.php";
        
        if (!File::exists($sourcePath)) {
            $this->error("Source file not found: {$sourcePath}");
            return 1;
        }

        if (!File::exists($targetDir)) {
            File::makeDirectory($targetDir, 0755, true);
        }

        $source = include $sourcePath;

        $this->info("Translating [{$from}] → [{$to}]");
        $translated = $this->translateArray($source, $from, $to);

        $output = "<?php\n\nreturn " . var_export($translated, true) . ";\n";
        File::put($targetPath, $output);

        $this->info("Translation file created: {$targetPath}");
        return 0;
    }

    /**
     * Recursively translate array of messages
     */
    private function translateArray(array $array, string $from, string $to)
    {
        $translated = [];
        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $translated[$key] = $this->translateArray($value, $from, $to);
            } else {
                $translated[$key] = $this->translateText($value, $from, $to);
                $this->line("✔️  {$key}");
                usleep(100000); 
            }
        }
        return $translated;
    }

    /**
     * Translate individual text using MyMemory API
     */
    private function translateText(string $text, string $from, string $to): string
    {
        try {
            $response = Http::timeout(8)->get('https://api.mymemory.translated.net/get', [
                'q' => $text,
                'langpair' => "{$from}|{$to}",
            ]);

            if ($response->successful()) {
                $translatedText = $response->json('responseData.translatedText');
                if ($translatedText) return $translatedText;
            }
        } catch (\Exception $e) {
            $this->warn("Translation failed for: {$text}");
        }
        return $text;
    }
}
