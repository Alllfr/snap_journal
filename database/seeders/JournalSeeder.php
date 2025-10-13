<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Journal;

class JournalSeeder extends Seeder
{
    public function run()
    {
        Journal::create([
            'title'       => 'Tes ilustrasi',
            'note'        => 'Ini catatan dengan ilustrasi dummy.',
            'illustrator' => ['https://placehold.co/600x400?text=Ilustrasi+Dummy'],
            'user_id'     => 13, 
            'emotion'     => 'happy',
            'confidence'  => 85.3,
            'tags'        => 'positif, ceria',
        ]);
    }
}
