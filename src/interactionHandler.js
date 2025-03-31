const { REMOVE_ROLE_ID, ADD_ROLE_ID, LOG_CHANNEL_ID } = process.env;
const { pool } = require('../utils/database');
const { checkRobloxGroup } = require('../utils/robloxApi'); // 로블록스 API 호출 함수
const { Client, Interaction } = require('discord.js');

// 버튼 클릭 처리
async function handleButtonClick(interaction) {
    const { customId, member, guild } = interaction;

    try {
        if (customId === 'start_register') {
            // 로블록스 아이디 입력 모달 열기
            await interaction.showModal({
                customId: 'serial_register_modal',
                title: '로블록스 아이디 입력',
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 4,  // 텍스트 입력
                                customId: 'roblox_id_input',
                                label: '자신의 로블록스 아이디를 입력해주세요.',
                                style: 1,
                                placeholder: '입력해주세요.',
                                required: true
                            }
                        ]
                    }
                ]
            });
        }
    } catch (error) {
        console.error('❌ 버튼 클릭 처리 중 오류:', error);
        await interaction.reply({ content: '문제가 발생했습니다. 다시 시도해주세요.', ephemeral: true });
    }
}

// 모달 제출 처리
async function handleModalSubmit(interaction) {
    const { customId, fields, member } = interaction;

    try {
        if (customId === 'serial_register_modal') {
            const robloxId = fields.getTextInputValue('roblox_id_input');

            // 로블록스 그룹 가입 여부 확인
            const isInGroup = await checkRobloxGroup(robloxId);

            if (!isInGroup) {
                await interaction.reply({ content: '로블록스 그룹에 가입되지 않았습니다. 다시 시도해주세요.', ephemeral: true });
                return;
            }

            // 고유번호 발급 처리 (DB에 기록)
            const serialNumber = await generateSerialNumber();

            // DB에 고유번호와 로블록스 아이디 기록
            await pool.query('INSERT INTO users (discord_id, roblox_id, serial_number) VALUES ($1, $2, $3)', [member.id, robloxId, serialNumber]);

            // 역할 업데이트: "미인증자" 제거, "인제군민" 추가
            await updateRoles(member);

            // DM 전송: 고유번호 발급 완료 메시지
            await member.send(`고유번호 발급이 완료되었습니다! 고유번호: ${serialNumber}`);

            // 로그 채널에 기록
            const logChannel = await member.guild.channels.fetch(LOG_CHANNEL_ID);
            logChannel.send(`✅ ${member.user.tag}님의 고유번호가 발급되었습니다. 고유번호: ${serialNumber}, 로블록스 아이디: ${robloxId}`);
            
            await interaction.reply({ content: '고유번호 발급이 완료되었습니다.', ephemeral: true });
        }
    } catch (error) {
        console.error('❌ 모달 제출 처리 중 오류:', error);
        await interaction.reply({ content: '문제가 발생했습니다. 다시 시도해주세요.', ephemeral: true });
    }
}

// 고유번호 발급용 번호 생성
async function generateSerialNumber() {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM users');
        const count = parseInt(result.rows[0].count);
        return count + 1;  // 고유번호는 사용자 수에 따라 증가
    } catch (error) {
        console.error('❌ 고유번호 생성 오류:', error);
        throw new Error('고유번호 생성 오류');
    }
}

// 역할 업데이트
async function updateRoles(member) {
    try {
        // "미인증자" 역할 제거
        await member.roles.remove(REMOVE_ROLE_ID);
        console.log(`"미인증자" 역할이 제거되었습니다.`);

        // "인제군민" 역할 추가
        await member.roles.add(ADD_ROLE_ID);
        console.log(`"인제군민" 역할이 추가되었습니다.`);
    } catch (error) {
        console.error('❌ 역할 업데이트 실패:', error);
    }
}

module.exports = {
    handleButtonClick,
    handleModalSubmit
};
