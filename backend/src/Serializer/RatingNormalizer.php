<?php

namespace App\Serializer;

use App\Entity\Item;
use App\Entity\Rating;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class RatingNormalizer implements NormalizerInterface
{
    public function __construct(
        #[Autowire(service: 'serializer.normalizer.object')]
        private readonly NormalizerInterface $normalizer,
    ) {
    }

    public function normalize(mixed $data, ?string $format = null, array $context = []): array
    {
        $data = $this->normalizer->normalize($data, $format, $context);

        // userRating
        $data['userRating'] = $data['userRating']['id'];

        // userRated
        $data['userRated'] = $data['userRated']['id'];
        
        // Message
        if(!isset($data['message'])) {
            $data['message'] = null;
        }

        return $data;
    }

    public function supportsNormalization($data, ?string $format = null, array $context = []): bool
    {
        return $data instanceof Rating;
    }

    public function getSupportedTypes(?string $format): array
    {
        return [
            Rating::class => true,
        ];
    }
}
