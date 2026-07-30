const { ContainerBuilder, Colors, MessageFlags } = require("discord.js");
const { channels, defaultColour } = require("./config");
const logger = require("./logger");

module.exports = (msg, client, severity = "info") => {

    const severityColours = {
        default: defaultColour,
        success: Colors.Green,
        info: Colors.Blue,
        warn: Colors.Yellow,
        danger: Colors.Red
    }
    const severityIcons = {
        default: "⚡",
        success: "✅",
        info: "ℹ️",
        warn: "⚠️",
        danger: "🚨"
    }
    const logContainer = new ContainerBuilder()
        .setAccentColor(!severityColours[severity] ? severityColours.default : severityColours[severity])
        .addTextDisplayComponents((textDisplay) => textDisplay
            .setContent(`${!severityIcons[severity] ? severityIcons.default : severityIcons[severity]}\n\`\`\`${msg}\`\`\``)
        );
    
    const logChannel = client.channels.cache.get(channels.logChannel);

    try {
        logChannel.send({
            components: [logContainer],
            flags: MessageFlags.IsComponentsV2
        })
    } catch (e) {
        logger.error(e, "Log channel message error");
    }

}