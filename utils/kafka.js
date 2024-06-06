// utils/kafka.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'hrm',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();

const produceUserEvent = async (operationType, user) => {
  await producer.connect();
  await producer.send({
    topic: 'hrm-user-changes',
    messages: [
      {
        value: JSON.stringify({
          operationType,
          user,
        }),
      },
    ],
  });
  await producer.disconnect();
};

module.exports = { produceUserEvent };
