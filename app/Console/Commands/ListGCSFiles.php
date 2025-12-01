<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class ListGCSFiles extends Command
{
    protected $signature = 'gcs:list {path?}';
    protected $description = 'List files and folders from Google Cloud Storage';

    public function handle()
    {
        $path = $this->argument('path') ?? '';
        $files = Storage::disk('google')->files($path);
        $dirs = Storage::disk('google')->directories($path);

        $this->info("Directories:");
        foreach ($dirs as $dir) {
            $this->line(" - " . $dir);
        }

        $this->info("\n Files:");
        foreach ($files as $file) {
            $this->line(" - " . $file);
        }

        $this->newLine();
        $this->info("Done");
    }
}
