import { CommandInteraction, TextChannel } from "discord.js"
import { replyHandler } from "../src/utils/replyHandler"

describe("replyHandler function", () => {
    let mockInteraction: CommandInteraction & { channel: TextChannel };
    let SHORT_MESSAGE = "Test message under the limit";
    let LONG_MESSAGE = "This message is over the limit ".repeat(100);

    beforeEach(() => {
        jest.clearAllMocks();

        mockInteraction = ({
            channel: {
                send: jest.fn(),
            },
            deferred: false,
            reply: jest.fn(),
            followUp: jest.fn(),
            deleteReply: jest.fn(),
        } as unknown) as CommandInteraction & { channel: TextChannel };
    });

    test("should handle a NON-DEFERRED message UNDER the character limit", async () => {
        await replyHandler(SHORT_MESSAGE, mockInteraction);

        expect(mockInteraction.reply).toHaveBeenCalledWith(SHORT_MESSAGE);
        expect(mockInteraction.followUp).not.toHaveBeenCalled();
        expect(mockInteraction.deleteReply).not.toHaveBeenCalled();
        expect(mockInteraction.channel?.send).not.toHaveBeenCalled();
    });

    test("should handle a NON-DEFERRED message OVER the character limit", async () => {
        await replyHandler(LONG_MESSAGE, mockInteraction);

        expect(mockInteraction.reply).not.toHaveBeenCalled();
        expect(mockInteraction.followUp).not.toHaveBeenCalled();
        expect(mockInteraction.deleteReply).not.toHaveBeenCalled();
        expect(mockInteraction.channel?.send).toHaveBeenCalled();
    });

    test("should handle a DEFERRED message UNDER the character limit", async () => {
        mockInteraction.deferred = true;
        await replyHandler(SHORT_MESSAGE, mockInteraction);

        expect(mockInteraction.reply).not.toHaveBeenCalled();
        expect(mockInteraction.followUp).toHaveBeenCalledWith(SHORT_MESSAGE);
        expect(mockInteraction.deleteReply).not.toHaveBeenCalled();
        expect(mockInteraction.channel?.send).not.toHaveBeenCalled();
    });

    test("should handle a DEFERRED message OVER the character limit", async () => {
        mockInteraction.deferred = true;
        await replyHandler(LONG_MESSAGE, mockInteraction);

        expect(mockInteraction.reply).not.toHaveBeenCalled();
        expect(mockInteraction.followUp).not.toHaveBeenCalled();
        expect(mockInteraction.deleteReply).toHaveBeenCalled();
        expect(mockInteraction.channel?.send).toHaveBeenCalled();
    });
})
