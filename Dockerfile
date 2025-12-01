# Gunakan image resmi PHP + Composer
FROM php:8.3-fpm

# Install dependensi sistem
RUN apt-get update && apt-get install -y \
    git zip unzip curl libpng-dev libonig-dev libxml2-dev libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy semua file project
COPY . .

# Install dependency Laravel
RUN composer install

# Pastikan folder penting ada sebelum set permission
RUN mkdir -p /var/www/storage /var/www/bootstrap/cache

# Set permission storage
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Jalankan PHP-FPM
CMD ["php-fpm"]