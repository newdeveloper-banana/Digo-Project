const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { getPlayerBySerial, updatePlayerRole } = require('../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('팩션역할변경')
        .setDescription('팩션 역할을 변경합니다.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const userRole = interaction.member.roles.cache;

        // "인제군청" 역할이 있는지 확인
        if (!userRole.has(process.env.FAX_ROLE_ID)) {
            return interaction.reply('이 명령어를 사용할 수 있는 권한이 없습니다. "인제군청" 역할이 필요합니다.');
        }

        // 첫 번째 입력창: 고유번호 입력받기
        await interaction.reply('역할이 변경될 사람의 고유번호를 입력해주세요. (숫자만 입력)');
        
        // 입력창으로 고유번호 받기 (여기선 간단히 번호 입력을 가정)
        const filter = response => !isNaN(response.content);
        const collector = interaction.channel.createMessageCollector({ filter, time: 15000 });

        collector.on('collect', async (message) => {
            const playerSerial = message.content;

            // DB에서 고유번호로 유저 찾기
            const player = await getPlayerBySerial(playerSerial);
            if (!player) {
                return interaction.followUp('해당 고유번호를 가진 유저를 찾을 수 없습니다.');
            }

            // 두 번째 단계: 역할 선택
            const roles = interaction.guild.roles.cache.filter(role => role.id !== interaction.guild.id); // 봇 역할 제외한 모든 역할
            const roleOptions = roles.map(role => ({
                label: role.name,
                value: role.id,
            }));

            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('role-select')
                        .setPlaceholder('추가할 역할을 선택해주세요.')
                        .addOptions(roleOptions),
                );

            await interaction.followUp({
                content: `${player.nickname} 님에게 추가할 역할을 선택해주세요.`,
                components: [row],
            });

            // 드롭다운 메뉴의 역할 선택
            const filterSelect = i => i.customId === 'role-select' && i.user.id === interaction.user.id;
            const selectCollector = interaction.channel.createMessageComponentCollector({ filter: filterSelect, time: 15000 });

            selectCollector.on('collect', async (i) => {
                const selectedRole = i.values[0];
                await i.update({ content: `${player.nickname} 님의 역할이 변경되었습니다!`, components: [] });

                // 역할 변경 로직
                const success = await updatePlayerRole(playerSerial, selectedRole);
                if (success) {
                    // DB에서 역할 변경 후, 유저에게 DM 보내기
                    await i.user.send(`${player.nickname}님의 역할이 ${selectedRole}로 변경되었습니다.`);

                    // 로그 채널에 로그 남기기
                    const logChannel = await interaction.client.channels.fetch(process.env.LOG_CHANNEL_ID);
                    logChannel.send(`역할이 변경되었습니다: ${player.nickname} - 새 역할: ${selectedRole}`);
                } else {
                    await i.user.send('역할 변경에 실패했습니다.');
                }
            });

            collector.stop();
        });
    }
};
