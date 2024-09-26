import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Image,
  Group,
  Badge,
  Button,
  TextInput,
  Loader,
} from "@mantine/core";
import {
  API_URL,
  fetchItemDetails,
  submitBid,
  fetchItemBids,
  fetchWinnerDetails,
} from "./api";
import styled from "styled-components";

const ResultContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f8ff;
  border-radius: 8px;
  text-align: center;
`;

const ResultText = styled.p`
  font-size: 18px;
  font-weight: bold;
  color: #4a4a4a;
`;

const WinningBid = styled.span`
  display: block;
  margin-top: 10px;
  font-size: 16px;
  color: #2c3e50;
`;

interface User {
  id: string;
  email: string;
}

interface Bid {
  id: number;
  attributes: {
    amount: number;
    users_permissions_user: {
      data: {
        id: number;
      };
    };
  };
}

interface ItemDetails {
  id: number;
  attributes: {
    title: string;
    description: string;
    startingBid: number;
    minIncrement: number;
    pictures: {
      data: {
        attributes: {
          url: string;
        };
      }[];
    };
    auction: {
      data: {
        attributes: {
          endsAt: string;
          startsAt: string;
        };
      };
    };
  };
}

const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");
  const [winner, setWinner] = useState<User | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  const userId = JSON.parse(localStorage.getItem("user") || "{}").id;

  const calculateTimeRemaining = (endDate: string): string | null => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) {
      return null;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    const loadItemDetailsAndBids = async () => {
      try {
        const [itemResponse, bidsResponse] = await Promise.all([
          fetchItemDetails(id!),
          fetchItemBids(id!),
        ]);
        setItem(itemResponse.data);
        setBids(bidsResponse.data);

        const auctionStartDate = new Date(
          itemResponse.data.attributes.auction.data.attributes.startsAt
        );
        const auctionEndDate = new Date(
          itemResponse.data.attributes.auction.data.attributes.endsAt
        );
        const now = new Date();

        if (now > auctionEndDate) {
          const highestBid = bidsResponse.data[0];
          if (highestBid) {
            const winnerResponse = await fetchWinnerDetails(
              highestBid.attributes.users_permissions_user.data.id
            );
            setWinner(winnerResponse);
          }
        } else if (now >= auctionStartDate) {
          // Start the countdown
          const intervalId = setInterval(() => {
            const remaining = calculateTimeRemaining(
              itemResponse.data.attributes.auction.data.attributes.endsAt
            );
            setTimeRemaining(remaining);
            if (!remaining) {
              clearInterval(intervalId);
            }
          }, 1000);

          return () => clearInterval(intervalId);
        } else {
          // Auction hasn't started yet
          setTimeRemaining(
            calculateTimeRemaining(auctionStartDate.toISOString())
          );
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch item details and bids");
      } finally {
        setLoading(false);
      }
    };

    loadItemDetailsAndBids();

    // Set up interval to refetch bids every 10 seconds
    const bidRefetchInterval = setInterval(async () => {
      try {
        const bidsResponse = await fetchItemBids(id!);
        setBids(bidsResponse.data);
      } catch (err) {
        console.error("Failed to refetch bids:", err);
      }
    }, 10000);

    // Clean up function to clear the interval
    return () => {
      clearInterval(bidRefetchInterval);
    };
  }, [id]);

  const isAuctionStarted = () => {
    if (!item) return false;
    const auctionStartDate = new Date(
      item.attributes.auction.data.attributes.startsAt
    );
    return new Date() >= auctionStartDate;
  };

  const isAuctionEnded = () => {
    if (!item) return false;
    const auctionEndDate = new Date(
      item.attributes.auction.data.attributes.endsAt
    );
    return new Date() > auctionEndDate;
  };

  const getHighestBid = () => {
    return bids.length > 0 ? bids[0].attributes.amount : 0;
  };

  const getMinimumBid = () => {
    if (!item) return 0;
    const highestBid = getHighestBid();
    const startingBid = item.attributes.startingBid;
    const minIncrement = item.attributes.minIncrement;
    return Math.max(startingBid, highestBid + minIncrement);
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidError("");
    const bidValue = parseFloat(bidAmount);
    const minimumBid = getMinimumBid();

    if (isNaN(bidValue) || bidValue < minimumBid) {
      setBidError(`Bid must be at least $${minimumBid.toFixed(2)}`);
      return;
    }

    try {
      await submitBid(id!, bidValue);
      const bidsResponse = await fetchItemBids(id!);
      setBids(bidsResponse.data);
      setBidAmount("");
    } catch (err) {
      console.error(err);
      setBidError("Failed to submit bid");
    }
  };

  if (loading)
    return (
      <Container>
        <Loader size="xl" />
      </Container>
    );
  if (error)
    return (
      <Container>
        <Text c="red">{error}</Text>
      </Container>
    );
  if (!item)
    return (
      <Container>
        <Text>Item not found</Text>
      </Container>
    );

  const highestBid = getHighestBid();
  const userHasHighestBid =
    bids.length > 0 &&
    bids[0].attributes.users_permissions_user.data.id === userId;

  return (
    <Container>
      <Title order={2} mb="xl">
        {item.attributes.title}
      </Title>
      <Group>
        {item.attributes.pictures.data.map((image, index) => (
          <Image
            key={index}
            src={`${API_URL}${image.attributes.url}`}
            width={200}
            height={200}
            fit="cover"
          />
        ))}
      </Group>
      <Text mt="md">{item.attributes.description}</Text>
      <Group mt="md">
        <Badge color="blue">Starting Bid: ${item.attributes.startingBid}</Badge>
        <Badge color="cyan">
          Min Increment: ${item.attributes.minIncrement}
        </Badge>
        <Badge color="green">Highest Bid: ${highestBid}</Badge>
      </Group>

      {timeRemaining && (
        <Text mt="md" size="lg" fw="bold" c="blue">
          {isAuctionStarted()
            ? `Time remaining: ${timeRemaining}`
            : `Auction starts in: ${timeRemaining}`}
        </Text>
      )}

      {isAuctionEnded() ? (
        <ResultContainer>
          {winner ? (
            <>
              <ResultText>
                🎉 Congratulations to the winner! 🎉
                <br />
                {winner.email} 🏆
              </ResultText>
              <WinningBid>Winning Bid: ${highestBid.toFixed(2)} 💰</WinningBid>
            </>
          ) : (
            <ResultText>😔 No bids were placed for this item.</ResultText>
          )}
        </ResultContainer>
      ) : isAuctionStarted() ? (
        <>
          {userHasHighestBid && (
            <Text mt="md" c="green" fw="bold">
              You currently have the highest bid!
            </Text>
          )}
          <form onSubmit={handleBidSubmit}>
            <Group mt="md">
              <TextInput
                placeholder="Enter your bid"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                type="number"
                min={getMinimumBid()}
              />
              <Button type="submit">Place Bid</Button>
            </Group>
          </form>
        </>
      ) : (
        <Text mt="md" c="orange" fw="bold">
          This auction hasn't started yet. Come back later to place your bid!
        </Text>
      )}
      {bidError && (
        <Text c="red" mt="sm">
          {bidError}
        </Text>
      )}
    </Container>
  );
};

export default ItemDetail;
