<?php

namespace App\Serializer;

use App\Entity\Item;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class ItemUsersNormalizer implements NormalizerInterface
{
    public function __construct(
        #[Autowire(service: 'serializer.normalizer.object')]
        private readonly NormalizerInterface $normalizer,
    ) {
    }

    public function normalize(mixed $data, ?string $format = null, array $context = []): array
    {
        $data = $this->normalizer->normalize($data, $format, $context);

        // Donor
        $data['donor'] = $data['donor']['id'];

        // Receiver
        if (isset($data['receiver']) && isset($data['receiver']['id'])) {
            $data['receiver'] = $data['receiver']['id'];
        } else {
            $data['receiver'] = null;
        }

        return $data;
    }

    public function supportsNormalization($data, ?string $format = null, array $context = []): bool
    {
        return $data instanceof Item;
    }

    public function getSupportedTypes(?string $format): array
    {
        return [
            Item::class => true,
        ];
    }
}
