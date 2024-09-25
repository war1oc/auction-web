import React, { useEffect, useState } from 'react';
import { API_URL, fetchAuctionItems } from './api';
import { Container, Title, Grid, Card, Image, Text, Group, Button, Loader, Pagination } from '@mantine/core';
import { Link } from 'react-router-dom';

interface Bid {
  id: number;
  amount: number;
  users_permissions_user: {
    id: number;
  };
}

interface AuctionItem {
    id: number;
    attributes: {
      title: string;
      description: string;
      startingBid: number;
      bids: Bid[];
      pictures: {
        data: {
          attributes: {
            url: string;
          };
        }[];
      };
    };
  }

  const AuctionItemList: React.FC = () => {
    const [items, setItems] = useState<AuctionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 9;

    useEffect(() => {
      const loadAuctionItems = async () => {
        setLoading(true);
        try {
          const response = await fetchAuctionItems(currentPage, pageSize);
          setItems(response.data);
          setTotalPages(response.meta.pagination.pageCount);
        } catch (err) {
          console.error(err);
          setError('Failed to fetch auction items');
        } finally {
          setLoading(false);
        }
      };

      loadAuctionItems();
    }, [currentPage]);

    const handlePageChange = (newPage: number) => {
      setCurrentPage(newPage);
    };

    if (loading) return <Container><Loader size="xl" /></Container>;
    if (error) return <Container><Text c="red">{error}</Text></Container>;

    return (
      <Container size="xl">
        <Title order={2} mb="xl">Current Auction Items</Title>
        <Grid>
          {items.map((item) => (
            <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section>
                {item.attributes.pictures.data.length > 0 ? (
                  <Image
                    src={`${API_URL}${item.attributes.pictures.data[0].attributes.url}`}
                    height={160}
                    alt={item.attributes.title}
                  />
                ) : (
                  <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
                    <Text>No image available</Text>
                  </div>
                )}
                </Card.Section>

                <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>{item.attributes.title}</Text>
                    {/* <Badge color="pink" variant="light">
                    Highest Bid: ${getHighestBid(item.attributes.bids)}
                    </Badge> */}
                </Group>

                <Text size="sm" c="dimmed" lineClamp={2}>
                    {item.attributes.description}
                </Text>

                <Button component={Link} to={`/item/${item.id}`} color="blue" fullWidth mt="md" radius="md">
                    View Details
                </Button>
                </Card>
            </Grid.Col>
          ))}
        </Grid>
        <Group justify="center" mt="xl">
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={handlePageChange}
          />
        </Group>
      </Container>
    );
  };

export default AuctionItemList;