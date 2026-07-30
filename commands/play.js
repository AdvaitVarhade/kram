// Search a movie or tv show
const {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
} = require("discord.js");
const logger = require("../utils/logger");
const { bggToken, defaultColour } = require("../utils/config");
const { XMLParser } = require("fast-xml-parser");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Search for a board game, rate it or queue it.")
    .addStringOption((option) =>
      option
        .setName("search_string")
        .setDescription("The string to search")
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option
        .setName("exact")
        .setDescription("Should it be an exact match?")
        .setRequired(false),
    ),
  async execute(interaction) {
    try {
      const res = await fetch(
        `https://boardgamegeek.com/xmlapi2/search?type=boardgame&exact=${!interaction.options.getBoolean("exact") || interaction.options.getBoolean("exact") !== false ? true : false}&query=${interaction.options.getString("search_string").toLowerCase().replaceAll(" ", "%20")}`,
        {
          headers: {
            Authorization: `Bearer ${bggToken}`,
          },
        },
      );

      const xmlData = await res.text();

      const parser = new XMLParser({
        ignoreAttributes: false, // Set to false to keep XML attributes (like id="101")
      });

      const bggData = parser.parse(xmlData);

      let gameId;
      let gameName;
      let yearPublished;
      let description;
      if (!Array.isArray(bggData.items.item)) {
        gameId = bggData.items.item["@_id"];
        gameName = bggData.items.item.name["@_value"];
        yearPublished = bggData.items.item["yearpublished"];
        description = bggData.items.item["description"];
      } else {
        const lowestItem = bggData.items.item
          .filter(
            (i) =>
              !i.name["@_value"].toLowerCase().includes("pack") &&
              !i.name["@_value"].toLowerCase().includes("expansion") &&
              !i.name["@_value"].toLowerCase().includes("promo"),
          )
          .reduce((prev, curr) =>
            parseInt(prev.yearpublished) > parseInt(curr.yearpublished)
              ? prev
              : curr,
          );

        gameId = lowestItem["@_id"];
        gameName = lowestItem.name["@_value"];
        yearPublished = lowestItem["yearpublished"];
        description = lowestItem["description"];
      }

      if (!gameId) {
        // no results
        return await interaction.reply({
          content: "No results found",
          flags: MessageFlags.Ephemeral,
        });
      }

      const thingResponse = await fetch(
        `https://boardgamegeek.com/xmlapi2/thing?type=boardgame&id=${gameId}`,
        {
          headers: {
            Authorization: `Bearer ${bggToken}`,
          },
        },
      );
      const thingXmlData = await thingResponse.text();

      const thingData = parser.parse(thingXmlData);

      const responseText = [
        `### [${gameName} (${yearPublished})](<https://boardgamegeek.com/boardgame/${gameId}>)`,
        `> ${description}`,
      ];
      if (Array.isArray(bggData.items.item) && bggData.items.item.length > 1) {
        responseText.push(
          ``,
          `-# _... and ${bggData.items.item.length - 1} other results_`,
        );
      }

      const responseContainer = new ContainerBuilder()
        .setAccentColor(defaultColour)
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent(responseText.join("\n")),
        )
        .addMediaGalleryComponents((mediaGallery) =>
          mediaGallery.addItems((mediaGalleryItem) =>
            mediaGalleryItem
              .setDescription(gameName)
              .setURL(thingData.items.item.image.toString()),
          ),
        );
      /*
      if (json.results.length > 1) {
        // add select menu with extras
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId("change_title")
          .setPlaceholder("Change result");

        for (const [id, result] of json.results.entries()) {
          const option = new StringSelectMenuOptionBuilder()
            .setValue(id.toString())
            .setLabel(!result.title ? result.original_name : result.title);

          selectMenu.addOptions(option);
        }
        responseContainer.addActionRowComponents((actionRow) =>
          actionRow.setComponents(selectMenu),
        );
      }
*/
      // const response =
      await interaction.reply({
        components: [responseContainer],
        flags: MessageFlags.IsComponentsV2,
        withResponse: true,
      });
      /*
      const responseFilter = (i) => i.user.id === interaction.user.id;

      const collector =
        response.resource.message.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 60_000,
          filter: responseFilter,
        });
      collector.on("collect", async (i) => {
        await i.deferUpdate();

        const first = json.results[parseInt(i.values[0])];

        const responseText = [
          `### [${!first.title ? first.original_name : first.title} (${!first.first_air_date ? first.release_date.split("-")[0] : first.first_air_date.split("-")[0]})](<https://www.themoviedb.org/${interaction.options.getString("search_type")}/${first.id}>)`,
          `> ${first.overview}`,
        ];
        if (json.results.length > 1) {
          responseText.push(
            ``,
            `-# _... and ${json.results.length - 1} other results_`,
          );
        }

        responseContainer.components[0].setContent(responseText.join("\n"));

        responseContainer.components[1] = new MediaGalleryBuilder().addItems(
          (mediaItem) =>
            mediaItem

              .setDescription(!first.title ? first.original_name : first.title)
              .setURL(
                `https://image.tmdb.org/t/p/original/${first.poster_path}`,
              ),
        );
        await interaction.editReply({
          components: [responseContainer],
        });
      });

      collector.on("end", async () => {
        responseContainer.components.pop();
        await interaction.editReply({ components: [responseContainer] });
      });
*/
      return;
    } catch (error) {
      logger.error(error, "Failed to search TMDB:");

      return await interaction.reply({
        content: "There was an error searching.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
