import React from 'react';
import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  VStack,
  HStack,
  IconButton,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import {
  FaTwitter,
  FaDiscord,
  FaGithub,
  FaTelegram,
  FaHeart,
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');

  const footerLinks = {
    marketplace: [
      { name: 'Browse NFTs', path: '/marketplace' },
      { name: 'Create NFT', path: '/create' },
      { name: 'My Profile', path: '/profile' },
      { name: 'Activity', path: '/activity' },
    ],
    resources: [
      { name: 'Help Center', path: '/help' },
      { name: 'Documentation', path: '/docs' },
      { name: 'API Reference', path: '/api' },
      { name: 'Blog', path: '/blog' },
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Contact', path: '/contact' },
      { name: 'Press Kit', path: '/press' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'DMCA', path: '/dmca' },
    ],
  };

  const socialLinks = [
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: 'https://twitter.com/nftmarket',
      color: '#1DA1F2',
    },
    {
      name: 'Discord',
      icon: FaDiscord,
      url: 'https://discord.gg/nftmarket',
      color: '#7289DA',
    },
    {
      name: 'GitHub',
      icon: FaGithub,
      url: 'https://github.com/nftmarket',
      color: '#333',
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      url: 'https://t.me/nftmarket',
      color: '#0088CC',
    },
  ];

  const LinkGroup = ({ title, links }) => (
    <VStack align="start" spacing={3}>
      <Text fontWeight="bold" fontSize="sm" color={headingColor}>
        {title}
      </Text>
      <VStack align="start" spacing={2}>
        {links.map((link) => (
          <Link
            key={link.name}
            as={RouterLink}
            to={link.path}
            fontSize="sm"
            color={textColor}
            _hover={{
              color: 'brand.500',
              textDecoration: 'none',
            }}
            transition="color 0.2s"
          >
            {link.name}
          </Link>
        ))}
      </VStack>
    </VStack>
  );

  return (
    <Box bg={bg} borderTop="1px" borderColor={borderColor} mt="auto">
      <Container maxW="7xl" py={12}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={8}>
          {/* Brand Section */}
          <VStack align="start" spacing={4}>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              bgGradient="linear(to-r, brand.500, purple.500)"
              bgClip="text"
            >
              NFT Market
            </Text>
            <Text fontSize="sm" color={textColor} maxW="250px">
              The premier destination for discovering, creating, and trading unique digital assets.
              Join our community of creators and collectors.
            </Text>
            <HStack spacing={2}>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <IconButton
                    key={social.name}
                    as={Link}
                    href={social.url}
                    isExternal
                    aria-label={social.name}
                    icon={<Icon />}
                    size="sm"
                    variant="ghost"
                    color={textColor}
                    _hover={{
                      color: social.color,
                      transform: 'translateY(-2px)',
                    }}
                    transition="all 0.2s"
                  />
                );
              })}
            </HStack>
          </VStack>

          {/* Link Groups */}
          <LinkGroup title="Marketplace" links={footerLinks.marketplace} />
          <LinkGroup title="Resources" links={footerLinks.resources} />
          <LinkGroup title="Company" links={footerLinks.company} />
          <LinkGroup title="Legal" links={footerLinks.legal} />
        </SimpleGrid>

        <Divider my={8} borderColor={borderColor} />

        {/* Bottom Section */}
        <Stack
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          spacing={4}
        >
          <Text fontSize="sm" color={textColor}>
            © {new Date().getFullYear()} NFT Market. All rights reserved.
          </Text>
          
          <HStack spacing={1} fontSize="sm" color={textColor}>
            <Text>Made with</Text>
            <Box as={FaHeart} color="red.500" />
            <Text>for the NFT community</Text>
          </HStack>

          <HStack spacing={4} fontSize="sm">
            <Link
              as={RouterLink}
              to="/privacy"
              color={textColor}
              _hover={{ color: 'brand.500' }}
            >
              Privacy
            </Link>
            <Link
              as={RouterLink}
              to="/terms"
              color={textColor}
              _hover={{ color: 'brand.500' }}
            >
              Terms
            </Link>
            <Link
              as={RouterLink}
              to="/cookies"
              color={textColor}
              _hover={{ color: 'brand.500' }}
            >
              Cookies
            </Link>
          </HStack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;