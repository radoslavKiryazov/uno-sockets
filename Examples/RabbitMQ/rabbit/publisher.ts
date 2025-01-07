import amqplib from "amqplib";

export async function publishToQueue(queueName, message) {
  try {
    const connection = await amqplib.connect("amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });

    channel.sendToQueue(queueName, Buffer.from(message));
    console.log(`Message sent to queue "${queueName}": ${message}`);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error in publishToQueue:", error);
  }
}
