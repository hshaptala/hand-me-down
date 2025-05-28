<?php

namespace App\Serializer;

use App\Entity\Member;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class MemberNormalizer implements NormalizerInterface
{
    public function __construct(
        #[Autowire(service: 'serializer.normalizer.object')]
        private readonly NormalizerInterface $normalizer,
    ) {
    }

    public function normalize(mixed $data, ?string $format = null, array $context = []): array
    {
        $data = $this->normalizer->normalize($data, $format, $context);

        // Move information to the root
        $data['id'] = $data['user']['id'];
        $data['firstName'] = $data['user']['firstName'];
        $data['lastName'] = $data['user']['lastName'];
        $data['avatarUrl'] = $data['user']['avatarUrl'];

        // Remove user
        unset($data['user']);

        return $data;
    }

    public function supportsNormalization($data, ?string $format = null, array $context = []): bool
    {
        return $data instanceof Member;
    }

    public function getSupportedTypes(?string $format): array
    {
        return [
            Member::class => true,
        ];
    }
}