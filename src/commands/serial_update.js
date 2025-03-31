const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const { pool } = require('../utils/database');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('고유번호변경')
        .setDescription('특정 사용자의 고유번호를 변경합니다.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // 관리자 권한 필요
    
    async execute(interaction) {
        const member = interaction.member;
        const adminRoles = [process.env.ADMIN_ROLE_ID, process.env.HEAD_ADMIN_ROLE_ID]; // 환경변수에서 역할 ID 가져오기

        if (!member.roles.cache.some(role => adminRoles.includes(role.id))) {
            return interaction.reply({ content: '이 명령어를 사용할 권한이 없습니다.', ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId('serial_update_modal')
            .setTitle('고유번호 변경');

        const currentSerialInput = new TextInputBuilder()
            .setCustomId('current_serial')
            .setLabel('누구의 고유번호를 변경하려고 하시나요?')
            .setPlaceholder('해당 자의 현재 고유번호를 입력해주세요.')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const newSerialInput = new TextInputBuilder()
            .setCustomId('new_serial')
            .setLabel('해당 자의 고유번호를 몇번으로 변경하실 건가요?')
            .setPlaceholder('변경될 고유번호를 입력해주세요.')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const reasonInput = new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('변경 이유를 작성해주세요.')
            .setPlaceholder('이유를 작성해주세요.')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(currentSerialInput);
        const secondActionRow = new ActionRowBuilder().addComponents(newSerialInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(reasonInput);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        await interaction.showModal(modal);
    }
};
