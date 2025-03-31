const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('고유번호발급')
        .setDescription('로블록스 계정을 연동하고 고유번호를 발급합니다.'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('고유번호 발급 과정을 시작합니다!')
            .setDescription(`${interaction.guild.name}에서 사용할 고유번호 발급을 시작하겠습니다.`)
            .setColor('BLUE');

        const startButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('start_register')
                .setLabel('>> 시작하기')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ embeds: [embed], components: [startButton], ephemeral: true });
    }
};
