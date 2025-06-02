<?php

namespace App\Serializer;

use App\Entity\Community;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class CommunityOwnerNormalizer implements NormalizerInterface
{
    public function __construct(
        #[Autowire(service: 'serializer.normalizer.object')]
        private readonly NormalizerInterface $normalizer,
    ) {
    }

    public function normalize(mixed $data, ?string $format = null, array $context = []): array
    {
        $data = $this->normalizer->normalize($data, $format, $context);

        // Owner id
        $data['owner'] = $data['owner']['id'];

        return $data;
    }

    public function supportsNormalization($data, ?string $format = null, array $context = []): bool
    {
        return $data instanceof Community;
    }

    public function getSupportedTypes(?string $format): array
    {
        return [
            Community::class => true,
        ];
    }
}