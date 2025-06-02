<?php

namespace App\DataFixtures;

use App\Entity\Community;
use App\Entity\Enum\CommunityRoleEnum;
use App\Entity\Enum\VisibilityEnum;
use App\Entity\Member;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\PasswordHasher\Hasher\PasswordHasherFactoryInterface;
use Symfony\Component\Security\Core\Validator\Constraints\UserPassword;

class AppFixtures extends Fixture
{

    private $params;
    private $userPasswordHasher;
    private $communityPasswordHasher;

    public function __construct(
        ParameterBagInterface $parameterBag,
        PasswordHasherFactoryInterface $hasherFactory
        )
    {   
        $this->params = $parameterBag;
        $this->userPasswordHasher = $hasherFactory->getPasswordHasher(User::class);
        $this->communityPasswordHasher = $hasherFactory->getPasswordHasher(Community::class);
    }

    public function load(ObjectManager $manager): void
    {
        // Images
        $projectDir = $this->params->get('kernel.project_dir');
        $folderPath = $projectDir . '/public/fixtures/';



        // ===== USERS =====

        // user_main
        $user_main = new User();
        $user_main
            ->setFirstName('Rekening')
            ->setLastName('Van Test')
            ->setEmail("testmain@mail.com")
            ->setPassword($this->userPasswordHasher->hash("password"))
            ->setToken(bin2hex(random_bytes(64)))
            ->setAvatar(file_get_contents($folderPath . 'pp.jpeg'))
            ->setJoinedAt(new \DateTimeImmutable())
        ;
        $manager->persist($user_main);

        // user_secondary
        $user_secondary = new User();
        $user_secondary
            ->setFirstName('testaccount')
            ->setLastName('testaccount')
            ->setEmail("testsecond@mail.com")
            ->setPassword($this->userPasswordHasher->hash("password"))
            ->setToken(bin2hex(random_bytes(64)))
            ->setJoinedAt(new \DateTimeImmutable())
        ;
        $manager->persist($user_secondary);

        // More users
        $user_3 = new User();
        $user_3
            ->setFirstName("3")
            ->setLastName("3")
            ->setEmail("test3@mail.com")
            ->setPassword($this->userPasswordHasher->hash("password"))
            ->setToken(bin2hex(random_bytes(64)))
            ->setJoinedAt(new \DateTimeImmutable())
        ;
        $manager->persist($user_3);
        $user_4 = new User();
        $user_4
            ->setFirstName("4")
            ->setLastName("4")
            ->setEmail("test4@mail.com")
            ->setPassword($this->userPasswordHasher->hash("password"))
            ->setToken(bin2hex(random_bytes(64)))
            ->setJoinedAt(new \DateTimeImmutable())
        ;
        $manager->persist($user_4);
        $user_5 = new User();
        $user_5
            ->setFirstName("5")
            ->setLastName("5")
            ->setEmail("test5@mail.com")
            ->setPassword($this->userPasswordHasher->hash("password"))
            ->setToken(bin2hex(random_bytes(64)))
            ->setJoinedAt(new \DateTimeImmutable())
        ;
        $manager->persist($user_5);
        $user_6 = new User();
        $user_6
            ->setFirstName("6")
            ->setLastName("6")
            ->setEmail("test6@mail.com")
            ->setPassword($this->userPasswordHasher->hash("password"))
            ->setToken(bin2hex(random_bytes(64)))
            ->setJoinedAt(new \DateTimeImmutable())
        ;
        $manager->persist($user_6);
 
        // ===== COMMUNITIES =====

        // Thomas more
        $community_thomasmore = new Community();
        $community_thomasmore
            ->setName("Thomas More Geel")
            ->setDescription("Community for students and teachers of Thomas More campus Geel to exchange items.")
            ->setCreatedAt(new \DateTimeImmutable())
            ->setLocation("Belgium, Geel")
            ->setVisibility(VisibilityEnum::PRIVATE)
            ->setPassword($this->communityPasswordHasher->hash( "password"))
            ->setImage(file_get_contents($folderPath . 'thomasmore.png'))
            ->setOwner($user_secondary)
        ;
        $manager->persist($community_thomasmore);

        // City of Geel
        $community_cityofgeel = new Community();
        $community_cityofgeel
            ->setName("City of Geel")
            ->setDescription("Hand me Down group for users living in Geel!")
            ->setCreatedAt(new \DateTimeImmutable())
            ->setLocation("Belgium, Geel")
            ->setVisibility(VisibilityEnum::PUBLIC)
            ->setImage(file_get_contents($folderPath . 'geel.jpg'))
            ->setOwner($user_main)
        ;
        $manager->persist($community_cityofgeel);

        // iut de bordeaux
        $community_iutbordeaux = new Community();
        $community_iutbordeaux
            ->setName("IUT de Bordeaux Gradignan")
            ->setDescription("Groupe d'échange de l'IUT de Bordeaux")
            ->setCreatedAt(new \DateTimeImmutable())
            ->setLocation("France, Gradignan")
            ->setVisibility(VisibilityEnum::PUBLIC)
            ->setImage(file_get_contents($folderPath . 'iut.jpeg'))
            ->setOwner($user_3)
        ;
        $manager->persist($community_iutbordeaux);



        // ===== MEMBERS =====

        // Main is ADMIN in Geel
        $member_main_geel = new Member();
        $member_main_geel
            ->setCommunity($community_cityofgeel)
            ->setUser($user_main)
            ->setRole(CommunityRoleEnum::ADMIN)
        ;
        $manager->persist($member_main_geel);

        // Secondary is ADMIN in Thomas More
        $member_secondary_thomasmore = new Member();
        $member_secondary_thomasmore
            ->setCommunity($community_thomasmore)
            ->setUser($user_secondary)
            ->setRole(CommunityRoleEnum::ADMIN)
        ;
        $manager->persist($member_secondary_thomasmore);

        // Secondary is MODERATOR in iut de bordeaux
        $member_secondary_iut = new Member();
        $member_secondary_iut
            ->setCommunity($community_iutbordeaux)
            ->setUser($user_secondary)
            ->setRole(CommunityRoleEnum::ADMIN)
        ;
        $manager->persist($member_secondary_iut);

        // More members
        $member_3 = new Member();
        $member_3
            ->setCommunity($community_thomasmore)
            ->setUser($user_3)
            ->setRole(CommunityRoleEnum::MEMBER)
        ;
        $manager->persist($member_3);
        $member_3 = new Member();
        $member_3
            ->setCommunity($community_iutbordeaux)
            ->setUser($user_3)
            ->setRole(CommunityRoleEnum::ADMIN)
        ;
        $manager->persist($member_3);
        $member_3 = new Member();
        $member_3
            ->setCommunity($community_cityofgeel)
            ->setUser($user_3)
            ->setRole(CommunityRoleEnum::MEMBER)
        ;
        $manager->persist($member_3);

        $member_4 = new Member();
        $member_4
            ->setCommunity($community_thomasmore)
            ->setUser($user_4)
            ->setRole(CommunityRoleEnum::MEMBER)
        ;
        $manager->persist($member_4);
        $member_4 = new Member();
        $member_4
            ->setCommunity($community_cityofgeel)
            ->setUser($user_4)
            ->setRole(CommunityRoleEnum::MEMBER)
        ;
        $manager->persist($member_4);

        $member_5 = new Member();
        $member_5
            ->setCommunity($community_thomasmore)
            ->setUser($user_5)
            ->setRole(CommunityRoleEnum::MEMBER)
        ;
        $manager->persist($member_5);
        $member_5 = new Member();
        $member_5
            ->setCommunity($community_cityofgeel)
            ->setUser($user_5)
            ->setRole(CommunityRoleEnum::MEMBER)
        ;
        $manager->persist($member_5);

        $member_6 = new Member();
        $member_6
            ->setCommunity($community_thomasmore)
            ->setUser($user_6)
            ->setRole(CommunityRoleEnum::MEMBER)
        ;
        $manager->persist($member_6);


        // ===== Flush ======
        $manager->flush();
    }
}
